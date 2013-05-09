'use strict';

/*Directives*/

angular.module('myDirectives', []).directive('tabs', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: function($scope, $element, TeacherScript, $timeout) {
            var panes = $scope.panes = [];
            var navPanes = $scope.navPanes = [];
            var currentPane;
            $scope.select = function(pane) {
                if(currentPane) {
                    currentPane.hide();
                }
                angular.forEach(panes, function(pane) {
                    pane.selected = false;
                });
                currentPane = pane;
                pane.selected = true;
                pane.select();
            }
            this.addPane = function(pane) {
                if (panes.length === 0) {
                    $scope.select(pane);
                }
                panes.push(pane);
            }
            this.addNavpane = function(navPane) {
                navPanes.push(navPane);
            }
            var $elem = $element;
            TeacherScript.get(function(result) {
                angular.forEach(result.tabs, function(tab, idx) {
                    panes[idx].tabIndex = idx;
                    panes[idx].addSections(tab.sections);
                    navPanes[idx].config = tab.navigation;
                });
            });
        },
        template:
            '<div class="tabbable">' +
                '<ul class="nav nav-tabs">' +
                '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'+
                '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
                '</li>' +
                '</ul>' +
                '<div class="tab-content" ng-transclude></div>' +
                '</div>',
        replace: true
    };
}).
    directive('pane', function($templateCache) {
        return {
            require: '^tabs',
            restrict: 'E',
            transclude: true,
            scope: { title: '@' },
            controller: function($scope, $element, $timeout) {
                $scope.waypoint = function() {
                    $timeout(function() {
                        $element.find('.content-section').waypoint(function(direction) {
                            if(!$(this).is(':visible')) {return;}
                            var $links = $('a[t="#' + this.id + '"]');
                            $links.toggleClass('active', direction === 'down');
                        }, {
                            context: '.tab-content',
                            offset: '100%'
                        })
                            .waypoint(function(direction) {
                                if(!$(this).is(':visible')) {return;}
                                var $links = $('a[t="#' + this.id + '"]');
                                $links.toggleClass('active', direction === 'up');
                            }, {
                                context: '.tab-content',
                                offset: function() {
                                    return -$(this).height();
                                }
                            });
                    });
                };
                $scope.addSections = function(sections) {
                    var that = this;
                    this.sections = sections;
                    $timeout(function($scope) {
                        that.enabled = true;
                        if($element.is(":visible")) {
                            if(!that.waypointEnabled) {
                                that.waypointEnabled = true;
                                that.waypoint();
                            }
                        }
                    });
                };
                $scope.select = function() {
                    if(this.enabled && !this.waypointEnabled) {
                        this.waypointEnabled = true;
                        this.waypoint();
                    }
                };
                $scope.hide = function() {
                    this.waypointEnabled = false;
                    $element.find('.content-section').waypoint('destroy');
                };
            },
            link: function(scope, element, attrs, tabsCtrl, $timeout) {
                tabsCtrl.addPane(scope);
            },
            template: $templateCache.get('tpl-pane'),
            replace: true
        };
    }).
    directive('navpane', function($templateCache) {
        return {
            require: '^tabs',
            restrict: 'E',
            scope: {},
            controller: function($scope, $element, $templateCache, $anchorScroll) {
                $scope.toggle = function($event) {
                    var $this = $($event.target);
                    $this.parent().toggleClass('expanded').parent().parent().find('> ul').slideToggle("fast");
                };
                $scope.toggleChilds = function($event) {
                    var $this = $($event.target);
                    $this.parent().toggleClass('expanded').parent().find('> ul').slideToggle("fast");
                };
                $scope.navTo = function(id) {
                    $('.tab-content:visible').scrollTo(id, 400, {
                        offset: {
                            top: -10
                        }
                    });
                };
            },
            link: function(scope, element, attrs, tabsCtrl) {
                tabsCtrl.addNavpane(scope);
            },
            templateUrl: 'partials/navpane.html',
            replace: true
        };
    })
    .directive('slider', function($templateCache) {
        return {
            restrict: 'E',
            scope: {},
            controller: function($scope, $element, PoeMaterials, $timeout, $rootScope) {
                var open = false,
                    activeIdx,
                    selectedItem;
                //Toggle materials panel
                $scope.toggle = function() {
                    if(open = !open) {
                        $element.find('.slideContent').animate({ width: '256px' });
                    } else {
                        $element.find('.slideContent').animate({ width: '40px' });
                        //Broadcast materialListCollapsed event when panel is closed.
                        $rootScope.$broadcast('materialListCollapsed');
                    }
                };
                $scope.toggleList = function(event, idx) {
                    var $elem = $element.find('.content ul');
                    $elem.eq(idx).toggle([100]);
                    if(activeIdx !== idx && typeof activeIdx !== 'undefined') {
                        $elem.eq(activeIdx).hide([100]);
                    }
                    activeIdx = idx;
                };
                PoeMaterials.get(function(result) {
                    var rslt = {
                        theme: result.theme,
                        items: result.items,
                        classes: result.classes
                    };
                    $scope.content = rslt;
                });
                $scope.select = function(item, parentIdx, myIndex, event) {
                    if(selectedItem) {
                        selectedItem.v.selected = false;
                    }
                    selectedItem = this;
                    this.v.selected = true;
                    $rootScope.$broadcast('materialSelected', {
                        item: item,
                        parentIndex: parentIdx,
                        index: myIndex
                    });
                };
                $scope.$on('overlay-dismissed', function() {
                    if(selectedItem) {
                        selectedItem.v.selected = false;
                    }
                });
            },
            link: function(scope, element, attrs, tabsCtrl) {
            },
            templateUrl: 'partials/slider.html',
            replace: true
        };
    }).directive('content', function() {
        return {
            restrict:'E',
            scope: {},
            replace: true,
            controller: function($scope, $rootScope) {
                $scope.isHidden = true;
                $scope.dismiss = function(event) {
                    $rootScope.$broadcast('overlay-dismissed');
                    this.isHidden = true;
                    this.isPopped = false;
                    this.item = null;
                };
                $scope.$on('materialSelected', function(config, obj) {
                    $scope.isHidden = false;
                    $scope.isPopped = false;
                    $scope.item = obj.item;
                });
                $scope.$on('materialListCollapsed', function(config, obj) {
                    $scope.dismiss();
                });
                $scope.imageClicked = function(event) {
                    if(this.item.enlargeable) {
                        $scope.isPopped = !$scope.isPopped;
                    }
                };
                $scope.getClasses = function() {
                    return this.item.type + (this.item.classes ? (' ' + this.item.classes) : '');
                };
            },
            templateUrl: 'partials/content.html'
        };
    }).directive('navHeader', function() {
        return {
            restrict: 'E',
            scope: {},
            replace: true,
            controller: function($scope, $location) {
                var path = $location.path(),
                    currentIndex = parseInt(path.charAt(path.length - 1)) - 1;
                $scope.title = 'Who Killed Edgar Allan Poe?';
                $scope.items = [{
                    selected: false,
                    href: '#/teacher/content/1'
                }, {
                    selected: false,
                    href: '#/teacher/content/2'
                }, {
                    selected: false,
                    href: '#/teacher/content/3'
                }]
                $scope.items[currentIndex].selected = true;
            },
            templateUrl: 'partials/nav-header.html'
        };
    });