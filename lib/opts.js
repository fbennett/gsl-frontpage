(function () {
    var optsClass = function (config) {
        this.config = config;
    }
    optsClass.prototype.getOpts = function () {
        var argparse = require('argparse')
        var ArgumentParser = argparse.ArgumentParser;
        var fs = require('fs');
        var optparse = new ArgumentParser({
            version: '0.0.1',
            addHelp:true,
            description: 'GSL Frontpage, a front-end for the English landing page of the Graduate School of Law, Nagoya University'
        });
        optparse.addArgument(
            [ '-H', '--proxy-hostname' ],
            {
                help: 'Host name for external access'
            }
        );
        optparse.addArgument(
            [ '-W', '--target-web-hostname' ],
            {
                help: 'Hostname of target server hosting the generated web pages'
            }
        );
        optparse.addArgument(
            [ '-Q', '--gslfrontpage-path' ],
            {
                help: 'Server path to GSL Frontpage (default: "/gslfrontpage/")'
            }
        );
        optparse.addArgument(
            [ '-t', '--top-page-path' ],
            {
                help: 'Filesystem path to top page on target server (including filename)'
            }
        );
        optparse.addArgument(
            [ '-E', '--events-path' ],
            {
                help: 'Filesystem path to events directory on target server (without trailing /)'
            }
        );
        optparse.addArgument(
            [ '-C', '--calendar-path' ],
            {
                help: 'Filesystem path to global calendar on target server (including filename)'
            }
        );
        optparse.addArgument(
            [ '-e', '--event-feed-path' ],
            {
                help: 'Filesystem path to Atom events feed on target server (including filename)'
            }
        );
        optparse.addArgument(
            [ '-R', '--events-relative' ],
            {
                help: 'Relative URL to events directory on target server (without trailing /)'
            }
        );
        optparse.addArgument(
            [ '-a', '--announcement-feed-path' ],
            {
                help: 'Explicit path to Atom announcements feed on target server filesystem (including filename)'
            }
        );
        optparse.addArgument(
            [ '-A', '--announcements-path' ],
            {
                help: 'Explicit path to announcements directory on target server (without trailing /)'
            }
        );
        optparse.addArgument(
            [ '-r', '--announcements-relative' ],
            {
                help: 'Relative URL to announcements directory on target server (without trailing /)'
            }
        );
        optparse.addArgument(
            [ '-p', '--real-port' ],
            {
                help: 'Port on which to listen for local connections'
            }
        );
        var args = optparse.parseArgs();
        if (args.real_port) {
            console.log("Reading config from gslfrontpage-" + args.real_port + ".cfg");
            try {
                var newconfig = JSON.parse(fs.readFileSync('gslfrontpage-' + args.real_port + '.cfg'));
                for (var key in newconfig) {
                    this.config[key] = newconfig[key];
                }
            } catch (err) {
                console.log("Warning: Error reading config file: "+err);
                //process.exit();
            }
        }
        var saveConfig = false;
        for (var key in args) {
            if (['isset','set','unset','get'].indexOf(key) > -1) continue;
            if (args[key] && this.config[key] != args[key]) {
                saveConfig = true;
                this.config[key] = args[key];
            }
        }
        // Put all opt error handling here
        var configOops = [];
        for (var key in this.config) {
            if (!this.config[key]) {
                configOops.push(key);
            }
        }
        if (configOops.length) {
            optparse.printHelp();
            for (var i=0,ilen=configOops.length;i<ilen;i+=1) {
                console.log("  ERROR: must set option "+configOops[i]);
            }
            return false;
        }
        if (saveConfig) {
            var configJson = JSON.stringify(this.config,null,2);
            fs.writeFileSync('gslfrontpage-' + this.config.real_port + '.cfg', configJson);
            console.log("Wrote config parameters to gslfrontpage-" + this.config.real_port + '.cfg');
            console.log("GSL Frontpage can now be run with the single option: -p " + this.config.real_port);
        }

        // Clean up some path values
        function stripSlashes (val) {
            if ("string" !== typeof val) return val;
            while (val && val.slice(0,1) === '/') {
                val = val.slice(1);
            }
            while (val && val.slice(-1) === '/') {
                val = val.slice(0,-1);
            }
            return val;
        }
        var relatives = ['gslfrontpage_path'];
        for (var i=0,ilen=relatives.length;i<ilen;i+=1) {
            this.config[relatives[i]] = stripSlashes(this.config[relatives[i]]);
        }

        var UrlEngine = function (config) {
            this.config = config;
            this.testInstance = true;
            var port = ':' + config.real_port;
            if (config.proxy_hostname.match(/.*\..*/)
                && config.proxy_hostname !== '127.0.0.1') {
                
                this.testInstance = false;
                port = '';
            }
            if ('string' === typeof arg) {
                this.hostname_and_port + '/' + config.gslfrontpage_path + '/' + arg;
            } else {
                var stub = null;
                if (this.testInstance) {
                    stub = '';
                } else {
                    stub = config.gslfrontpage_path + '/admin.html';
                }
                this.hostname_and_port = 'http://' + config.proxy_hostname + port;
            }
        };
        
        UrlEngine.prototype.init = function (id,key) {
            this.id = id;
            this.key = key;
            if (this.testInstance) {
                this.stub = '';
                this.adminstuff = 'admin=' + this.key + '&';
            } else {
                this.stub = this.config.gslfrontpage_path + '/admin.html';
                this.adminstuff = '';
            }
        };

        

        UrlEngine.prototype.getQueryString = function (obj) {
            var ret = [];
            for (var key in obj) {
                ret.push(key + '=' + obj[key])
            }
            return ret.join('&');
        };

        UrlEngine.prototype.page = function (id,key) {
            if (!this.id || !this.key) throw "getHostURL() run before init() in UrlEngine.";
            return this.hostname_and_port + '/' + this.stub + '?' + this.adminstuff + this.getQueryString({id:id,key:key});
        };
        this.config.urlEngine = new UrlEngine(this.config);
        
        return this.config;
    }
    exports.optsClass = optsClass;
})();
