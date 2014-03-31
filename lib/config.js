(function () {
    var config = {
        newswriter_hostname: null,
        newswriter_port: 6338,
        newswriter_top_relative: 'newswriter',
        target_hostname: null,
        target_top_relative: null,
        target_announcements_relative: null,
        target_events_relative: null,
        fs_top_page_file: null,
        fs_calendar_file: null,
        fs_announcement_feed_file: null,
        fs_event_feed_file: null,
        fs_announcements_dir: null,
        fs_events_dir: null,
        rsync_binary:null,
        ssh_binary:null,
        account_name:null,
        sshpass_binary:null,
        fs_local_dir:null,
        output_style: null
    }
    exports.config = config;
})();
