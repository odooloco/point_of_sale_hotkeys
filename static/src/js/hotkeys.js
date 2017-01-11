odoo.define('hotkeys', function (require) {
	"use strict";

	// Se importan los modulos necesarios
	var core = require('web.core');
	var models = require('point_of_sale.models');
	var session = require('web.session');
	var PosDB = require('point_of_sale.DB');
	var Gui = require('point_of_sale.gui');
	var chrome = require('point_of_sale.chrome');
	var ajax = require('web.ajax');
	var Model = require('web.Model');
	var data = require('web.data');
	var PosBaseWidget = require('point_of_sale.BaseWidget');
	var Screens = require('point_of_sale.screens');



	var _super_posmodel = models.PosModel.prototype;
	models.PosModel = models.PosModel.extend({
	    initialize: function(session, attributes) {
	    	var self = this;
	    	_super_posmodel.initialize.call(this,session,attributes);
	    	self.guiIsReady();
	    },
	    guiIsReady : function(){
	    	var self = this;
	    	$(document).ready(function(){
				self.ready.done(function(){

					self.addEvents();

					


				});
			})
	    },
	    eventOrderLine : function( type ){
	    	var selected = false;
	    	var obj = false;
			$('li.orderline').each(function(){
				if( type == 'down' ){
					if( selected ){
						$(this).click();
						selected = false;
					}

					if( $(this).hasClass('selected') ){
						selected = true
					}
				} else if( type == 'up' ) {
					if( $(this).hasClass('selected') ){
						if( obj  ){
							obj.click();	
						}
						
					}
					obj = $(this);

				}
				

				
			});
	    },
	    eventProduct : function( type ){
	    	var self = this;
	    	var product_selected = $('.product').hasClass('product_selected');
	    	if( ! product_selected ){
				$('div.product-list > .product').each(function(){
					$(this).addClass('product_selected');
	    			return false;					
				});	    		
	    	} else {
	    		product_selected = false;
	    		var product_obj = false;

	    		if( type == 'right' ){
	    			$('div.product-list > .product').each(function(){
		    			if( product_selected ){
		    				product_obj.removeClass('product_selected');
		    				$(this).addClass('product_selected');

		    				product_obj = false;
		    				product_selected = false;

		    				return false;
		    			}

		    			product_selected = $(this).hasClass('product_selected');
		    			product_obj = $(this);
		    		});
	    		} else if ( type == 'left' ) {
	    			
	    			$('div.product-list > .product').each(function(){
	    				product_selected = $(this).hasClass('product_selected');

	    				if( $('.product:first').hasClass('product_selected') ){
	    					return false;
	    				}

	    				if( product_selected  ){
	    					$(this).removeClass('product_selected');
	    					product_obj.addClass('product_selected');

	    					product_obj = false;
		    				product_selected = false;

		    				return false;
	    				}

	    				product_obj = $(this);

	    				
	    			});
	    		} else if ( type == 'down' ) {
	    			var width = $('.product-list').width();
	    			var products = Math.round(width / 142);
	    			if( (width / 142 ) < 3 ){
	    				products = 2;
	    			}

	    			for( var n = 1; n <= products; n++ ){
	    				self.eventProduct('right');
	    			}

	    		} else if ( type == 'up' ) {
	    			var width = $('.product-list').width();
	    			var products = Math.round(width / 142);

	    			if( (width / 142 ) < 3 ){
	    				products = 2;
	    			}
	    			for( var n = 1; n <= products; n++ ){
	    				self.eventProduct('left');
	    			}

	    		}

	    		
	    	}


	    	/*$('div.product-list > .product').each(function(){
	    		if( type == 'right' ){

	    			$(this).addClass('product_selected');
	    			return false;
	    		}
	    	});*/
	    },
	    addEvents : function(){
	    	var self = this;

	    	Mousetrap.bindGlobal('c', function(){
	    		if( ! $('.next').is(":visible") ){
	    			$('.mode-button[data-mode="quantity"]').click();
	    		}
				
			});

			Mousetrap.bindGlobal('d', function(){
				if( ! $('.next').is(":visible") ){
					$('.mode-button[data-mode="discount"]').click();
				}
			});

			Mousetrap.bindGlobal('p', function(){
				if( ! $('.next').is(":visible") ){
					$('.mode-button[data-mode="price"]').click();
				}
				
			});

			Mousetrap.bindGlobal('backspace', function(){
				if( ! $('.next').is(":visible") ){
					$('.numpad-backspace')[0].click();	
				}
				
			});

			
			Mousetrap.bindGlobal('ctrl+b', function(){
				if( ! $('.next').is(":visible") ){
					$('.searchbox > input').focus();

					$('.searchbox > input').bind('keydown', 'tab', function( e ){
						$('.searchbox > input').blur();
					});


				}
			});

			Mousetrap.bindGlobal('ctrl+c', function() {
			    if( ! $('.next').is(":visible") ){
					$('.set-customer').click();
				}
			});

			/*$(document).keyup(function(e) {
				console.log( 'evento', e.keyCode, e.ctrlKey );
			     if (e.keyCode == 27) { // escape key maps to keycode `27`
			        console.log('Entra 2');
			    }

			    if (e.keyCode == 66) { // escape key maps to keycode `27`
			        $('.set-customer').click();
			    }

			});*/

			/*Mousetrap.bindGlobal('ctrl+c', function(){
				if( ! $('.next').is(":visible") ){
					$('.set-customer').click();
				}
				
			});*/

			Mousetrap.bindGlobal('ctrl+return', function(){
				if( ! $('.next').is(":visible") ){
					$('.pay').click();
				}
			});

			Mousetrap.bindGlobal('return', function(){
				if( ! $('.next').is(":visible") ){
					var product_selected = $('.product').hasClass('product_selected');

					if( product_selected ){
						$('.product.product_selected').click();
						$('.product').removeClass('product_selected');
					}
				}
				

				
			});

			Mousetrap.bindGlobal('ctrl+up', function(){
				if( ! $('.next').is(":visible") ){
					self.eventOrderLine('up');
				}
				
			});

			Mousetrap.bindGlobal('ctrl+down', function(){
				if( ! $('.next').is(":visible") ){
					self.eventOrderLine('down');
				}
				
			});

			/*Mousetrap.bindGlobal('tab', function(){
				console.log('Entraaa');
				$('.breadcrumb-button').click();
				
			});*/

			Mousetrap.bindGlobal('shift+down', function(){
				if( ! $('.next').is(":visible") ){
					self.eventProduct('down');
				}
				
			});

			Mousetrap.bindGlobal('shift+up', function(){
				if( ! $('.next').is(":visible") ){
					self.eventProduct('up');
				}
				
			});

			Mousetrap.bindGlobal('shift+right', function(){
				if( ! $('.next').is(":visible") ){
					self.eventProduct('right');
				}
				
			});

			Mousetrap.bindGlobal('shift+left', function(){
				if( ! $('.next').is(":visible") ){
					self.eventProduct('left');
				}
				
			});

			setTimeout(function(){

				var s = [];
				$('div[class="numpad"] > button.number-char').each(function(){
					var num = $(this).html();
					var obj = $(this);

					if( s.indexOf( num ) == -1 ){
						s.push( num );

						Mousetrap.bindGlobal(num, function(){
							if( ! $('.next').is(":visible") ){
								obj.click();
							}
							
						});	
					}

					
					
				});	


			}, 3000);
			
	    }

	});



   
 });
