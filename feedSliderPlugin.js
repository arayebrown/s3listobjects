;(function ($, google, window, document, undefined) {
    var pluginName = "feedContentSlider",
        defaults = {
            template: '<button class="previous"></button><div class="entries"></div><button class="next"></button>',
            placeholder: ''
        };

    // Plugin constructor.
    function Plugin(element, options) {
        this.element = element;

        // Merge properties of the defaults and options objects.
        this.options = $.extend({}, defaults, options);

        // Standard jQuery plugin design to stash away the defaults, if any.
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Initialize!
    Plugin.prototype.init = function () {
        var url = this.options.url,
            $el = $(this.element),
            placeholder = this.options.placeholder;

        //set up slider structure
        $el.html(this.options.template);

        //attach button handlers
        $el.find('button.previous').click(this.buttonClick);
        $el.find('button.next').click(this.buttonClick);

        //load and handle the blog feed
        this.fetchFeed(url, $el, placeholder);

        setInterval(function() {
            $el.find('button.next').trigger('click');
        },7000);
    };

    Plugin.prototype.buttonClick = function (ev) {
        if (ev && ev.target) {
            var $target = $(ev.target),
                $current = $('.entry.active'),
                $entries = $('.entries'),
                newView,
                pos;

            if ($target.hasClass('previous')) {
                newView = $current.removeClass('active').prev();
                if (newView.length === 0) {
                    newView = $('.entry').last();
                }
            } else if ($target.hasClass('next')) {
                newView = $current.removeClass('active').next();
                if (newView.length === 0) {
                    newView = $('.entry').first();
                }

            }
            newView.addClass('active');
            pos = $(newView).position();
            $entries.animate({left: -pos.left}, 800);
            ev.preventDefault();
        }
    };

    Plugin.prototype.fetchFeed = function (url, el, placeholder) {

        google.load('feeds', '1', {'nocss': 1});

        function initFeed() {
            var feed = new google.feeds.Feed(url);
            feed.setNumEntries(10);
            feed.setResultFormat(google.feeds.Feed.MIXED_FORMAT);
            feed.load(function (result) {
                if (!result.error) {
                    var len = result.feed.entries.length,
                        entries = result.feed.entries,
                        entry,
                        enclosure,
                        imgDD = '',
                        i = 0;

                    for (i; i < len; i+=1) {
                        entry = entries[i];
                        enclosure = entry.xmlNode.getElementsByTagName('enclosure');
                        if (enclosure[0]) {
                            var obj = enclosure[0].attributes;
                            for (var k = 0; k < obj.length; k+=1) {
                                var item = obj[k];
                                if (typeof item === 'object' && item.name === 'url'){
                                    imgDD = '<dd class="entry-img"><img src="' + item.value + '" alt="' + entry.title + '"></dd>'

                                }
                            }
                        }
                        el.find('.entries').append(
                            '<dl class="entry">' +
                                '<dt class="entry-title">' + entry.title + '</dt>' +
                                imgDD +
                                '<dd class="entry-description">' + entry.contentSnippet+ '</dd>' +
                                '<dd class="entry-link"><a target="_blank" href="' + entry.link + '">read more...</a></dd>' +
                            '</dl>');
                    }

                    el.find('.entry').first().addClass('active');
                } else {
                    // Handle when the feed is not found.
                    $('#blog-slider').html('<img src=' + placeholder + '>');
                }
            });
        }

        google.setOnLoadCallback(initFeed);
    };

    // Prevent instantiating more than one of this plugin.
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data( this, "plugin_" + pluginName,
                    new Plugin(this, options));
            }
        });
    };
})(jQuery, google, window, document);
