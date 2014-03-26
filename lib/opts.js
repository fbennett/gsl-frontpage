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
            [ '-m', '--email-account' ],
            {
                help: 'Full username of email account (e.g. useme@gmail.com)'
            }
        );
        optparse.addArgument(
            [ '-t', '--top-page-path' ],
            {
                help: 'Explicit path to top page on target server filesystem (including filename)'
            }
        );
        optparse.addArgument(
            [ '-e', '--event-feed-path' ],
            {
                help: 'Explicit path to Atom events feed on target server filesystem (including filename)'
            }
        );
        optparse.addArgument(
            [ '-a', '--announcement-feed-path' ],
            {
                help: 'Explicit path to Atom announcements feed on target server filesystem (including filename)'
            }
        );
        optparse.addArgument(
            [ '-E', '--events-path' ],
            {
                help: 'Explicit path to events directory on target server (without /)'
            }
        );
        optparse.addArgument(
            [ '-A', '--announcements-path' ],
            {
                help: 'Explicit path to announcements directory on target server (without /)'
            }
        );
        optparse.addArgument(
            [ '-p', '--real-port' ],
            {
                help: 'Port on which to listen for local connections'
            }
        );
        optparse.addArgument(
            [ '-m', '--email-account' ],
            {
                help: 'Full username of email account (e.g. useme@gmail.com)'
            }
        );
        optparse.addArgument(
            [ '-s', '--smtp-host' ],
            {
                help: 'SMTP host name (e.g. smtp.gmail.com)'
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
        return this.config;
    }
    exports.optsClass = optsClass;
})();
