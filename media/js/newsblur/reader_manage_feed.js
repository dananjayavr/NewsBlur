NEWSBLUR.ReaderManageFeed = function(feed_id, options) {
    var defaults = {};
    
    this.options = $.extend({}, defaults, options);
    this.model = NEWSBLUR.AssetModel.reader();
    this.feed_id = feed_id;
    this.feed = this.model.get_feed(feed_id);
    this.feeds = this.model.get_feeds();
    this.google_favicon_url = 'http://www.google.com/s2/favicons?domain_url=';
    this.runner();
};

NEWSBLUR.ReaderManageFeed.prototype = {
    
    runner: function() {
        this.make_modal();
        this.handle_cancel();
        this.open_modal();
    },
    
    make_modal: function() {
        var self = this;
        
        this.$manage = $.make('div', { className: 'NB-manage NB-modal' }, [
            $.make('div', { className: 'NB-manage-feed-chooser-container'}, [
                $.make('a', { href: '#', className: 'NB-manage-feed-chooser-next' }, '&raquo;'),
                $.make('a', { href: '#', className: 'NB-manage-feed-chooser-previous' }, '&laquo;'),
                this.make_feed_chooser()
            ]),
            $.make('h2', { className: 'NB-modal-title' }, this.feed['feed_title']),
            $.make('form', { method: 'post', className: 'NB-manage-form' }, [
                $.make('div', { className: 'NB-manage-field' }, [
                    $.make('h5', [
                        'What you ',
                        $.make('span', { className: 'NB-classifier-like' }, 'like')
                    ]),
                    $.make('h5', [
                        'What you ',
                        $.make('span', { className: 'NB-classifier-like' }, 'dislike')
                    ]),
                    $.make('h5', 'Management')
                ]),
                $.make('div', { className: 'NB-modal-submit' }, [
                    $.make('input', { name: 'feed_id', value: this.feed_id, type: 'hidden' }),
                    $.make('input', { type: 'submit', disabled: 'true', className: 'NB-disabled', value: 'Check what you like above...' }),
                    ' or ',
                    $.make('a', { href: '#', className: 'NB-modal-cancel' }, 'cancel')
                ])
            ]).bind('submit', function(e) {
                e.preventDefault();
                self.save();
                return false;
            })
        ]);
    
    },
    
    make_feed_chooser: function() {
        var $chooser = $.make('select', { name: 'feed', className: 'NB-manage-feed-chooser' });
        
        for (var f in this.feeds) {
            var feed = this.feeds[f];
            var $option = $.make('option', { value: feed.id }, feed.feed_title);
            $option.appendTo($chooser);
            
            if (feed.id == this.feed_id) {
                $option.attr('selected', true);
            }
        }
        
        $('option', $chooser).tsort();
        return $chooser;
    },
        
    open_modal: function() {
        var self = this;

        var $holder = $.make('div', { className: 'NB-modal-holder' }).append(this.$manage).appendTo('body').css({'visibility': 'hidden', 'display': 'block', 'width': 600});
        var height = $('.NB-manage', $holder).outerHeight(true);
        $holder.css({'visibility': 'visible', 'display': 'none'});
        
        this.$manage.modal({
            'minWidth': 600,
            'minHeight': height,
            'overlayClose': true,
            'onOpen': function (dialog) {
	            dialog.overlay.fadeIn(200, function () {
		            dialog.container.fadeIn(200);
		            dialog.data.fadeIn(200);
	            });
            },
            'onShow': function(dialog) {
                $('#simplemodal-container').corners('6px').css({'width': 600, 'height': height});
                // $('.NB-classifier-tag', self.$manage).corners('4px');
            },
            'onClose': function(dialog) {
                dialog.data.hide().empty().remove();
                dialog.container.hide().empty().remove();
                dialog.overlay.fadeOut(200, function() {
                    dialog.overlay.empty().remove();
                    $.modal.close();
                });
                $('.NB-modal-holder').empty().remove();
            }
        });
    },
    
    handle_cancel: function() {
        var $cancel = $('.NB-modal-cancel', this.$manage);
        
        $cancel.click(function(e) {
            e.preventDefault();
            $.modal.close();
        });
    },
    
    serialize_classifier: function() {
        var data = $('.NB-manage form input').serialize();
        
        return data;
    },
    
    save: function() {
        var $save = $('.NB-modal input[type=submit]');
        var data = this.serialize_classifier();
        
        $save.text('Saving...').addClass('NB-disabled').attr('disabled', true);
        this.model.save_classifier_publisher(data, function() {
            $.modal.close();
        });
    }
    
};