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
            [ '-S', '--output-style' ],
            {
                help: 'Style to use for output'
            }
        );
        optparse.addArgument(
            [ '-H', '--newswriter-hostname' ],
            {
                help: 'Host name for external access'
            }
        );
        optparse.addArgument(
            [ '-p', '--newswriter-port' ],
            {
                help: 'Port on which to listen for local connections'
            }
        );
        optparse.addArgument(
            [ '-F', '--newswriter-top-relative' ],
            {
                help: 'Relative path to NewsWriter (default: "newswriter")'
            }
        );
        optparse.addArgument(
            [ '-W', '--target-hostname' ],
            {
                help: 'Hostname of server that will host the generated web pages'
            }
        );
        optparse.addArgument(
            [ '-f', '--target-top-relative' ],
            {
                help: 'Relative URL to top of target server'
            }
        );
        optparse.addArgument(
            [ '-i', '--target-announcements-relative' ],
            {
                help: 'Relative URL to announcements on target server'
            }
        );
        optparse.addArgument(
            [ '-s', '--target-events-relative' ],
            {
                help: 'Relative URL to events directory on target server'
            }
        );
        optparse.addArgument(
            [ '-t', '--fs-top-page-file' ],
            {
                help: 'Filesystem path to top page on target server'
            }
        );
        optparse.addArgument(
            [ '-c', '--fs-calendar-file' ],
            {
                help: 'Filesystem path to consolidated calendar on target server'
            }
        );
        optparse.addArgument(
            [ '-n', '--fs-announcement-feed-file' ],
            {
                help: 'Filesystem path to announcements feed on target server'
            }
        );
        optparse.addArgument(
            [ '-e', '--fs-event-feed-file' ],
            {
                help: 'Filesystem path to events feed on target server'
            }
        );
        optparse.addArgument(
            [ '-N', '--fs-announcements-dir' ],
            {
                help: 'Explicit path to announcements directory on target server'
            }
        );
        optparse.addArgument(
            [ '-E', '--fs-events-dir' ],
            {
                help: 'Filesystem path to events directory on target server'
            }
        );
        var args = optparse.parseArgs();
        if (args.newswriter_port) {
            console.log("Reading config from newswriter-" + args.newswriter_port + ".cfg");
            try {
                var newconfig = JSON.parse(fs.readFileSync('newswriter-' + args.newswriter_port + '.cfg'));
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
            if (null === this.config[key]) {
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
            fs.writeFileSync('newswriter-' + this.config.newswriter_port + '.cfg', configJson);
            console.log("Wrote config parameters to newswriter-" + this.config.newswriter_port + '.cfg');
            console.log("NewWriter can now be run with the single option: -p " + this.config.newswriter_port);
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
        var relatives = ['newswriter_top_relative'];
        for (var i=0,ilen=relatives.length;i<ilen;i+=1) {
            this.config[relatives[i]] = stripSlashes(this.config[relatives[i]]);
        }

        var UrlEngine = function (config) {
            this.config = config;
            this.testInstance = true;
            var port = ':' + config.newswriter_port;
            if (config.newswriter_hostname.match(/.*\..*/)
                && config.newswriter_hostname !== '127.0.0.1') {
                
                this.testInstance = false;
                port = '';
            }
            if ('string' === typeof arg) {
                this.hostname_and_port + '/' + config.newswriter_top_relative + '/' + arg;
            } else {
                var stub = null;
                if (this.testInstance) {
                    stub = '';
                } else {
                    stub = config.newswriter_top_relative + '/admin.html';
                }
                this.hostname_and_port = config.newswriter_hostname + port;
            }
        };
        
        UrlEngine.prototype.init = function (id,key) {
            this.id = id;
            this.key = key;
            if (this.testInstance) {
                this.stub = '';
                this.adminstuff = 'admin=' + this.key + '&';
            } else {
                this.stub = this.config.newswriter_top_relative + '/admin.html';
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

        UrlEngine.prototype.xmlEscape = function (str) {
            return str.replace(/&/g,'&amp;');
        };

        UrlEngine.prototype.page = function (id,key,xmlEscape) {
            if (!this.id || !this.key) throw "getHostURL() run before init() in UrlEngine.";
            var queryString = this.adminstuff + this.getQueryString({id:id,key:key});
            if (xmlEscape) {
                queryString = this.xmlEscape(queryString);
            }
            return 'http://' + this.hostname_and_port + '/' + this.stub + '?' + queryString;
        };

        UrlEngine.prototype.hostname = function () {
            return this.hostname_and_port;
        };

        UrlEngine.prototype.hostpath = function () {
            var ret;
            if (this.testInstance) {
                ret = this.hostname_and_port;
            } else {
                ret = this.hostname_and_port + '/' + this.config.newswriter_top_relative;
            }
            return ret;
        };

        UrlEngine.prototype.target = function () {
            return 'http://' + this.config.target_hostname;
        };

        this.config.urlEngine = new UrlEngine(this.config);
        
        return this.config;
    }
    exports.optsClass = optsClass;
})();
