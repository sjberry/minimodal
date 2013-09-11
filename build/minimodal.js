/**
 * @license
 * Copyright (C) 2013 Steven Berry (http://www.sberry.me/minimodal)
 * Licensed: MIT (http://opensource.org/licenses/mit-license.php)
 * License Stipulations:
 *     1) Retain this comment block.
 *     2) Send me an email if you use this and have questions/comments!
 * 
 * Steven Berry
 * www.sberry.me
 * steven@sberry.me
 */

(function(window, $, undefined) {
	var $shade;
	
	// Prepare the DOM with necessary elements for minimodal operation.
	$(document).ready(function() {
		// Create the minimodal shade element and insert it (hidden) into the document body.
		$(document.body).append('<div id="minimodal-shade"></div>');
		// Retain an internal reference to the shade element.
		$shade = $('#minimodal-shade').hide();
		
		// Handle click events on any .modal-close classed element to close the active modal.
		$(document).delegate('.modal-close', 'click', function(e) {
			$.modal.close();
		});
	});
	
	/**
	 * Helper function that constructs an object to be passed
	 * into jQuery's .trigger() on `modalopen` and `modalclose`.
	 * The eventData function parameter on the modal is used to
	 * set the object values.
	 *
	 * @private
	 * @param {string} [type] The type of event that will be triggered.
	 * @returns {Object} An object with event key/value pairs to be passed to $.trigger().
	 */
	function getEvent(type) {
		var event = { type: type };
		
		if ($.isFunction(this.eventData)) {
			$.extend(event, this.eventData.call(this.obj));
		}
		
		return event;
	}
	
	/**
	 * An internally referenced object that keeps track of key variables
	 * and associates a $.fn.modal() call with some prototype functions.
	 *
	 * @private
	 * @class
	 * @param {jQuery} obj A jQuery object to use as the active modal.
	 * @param {Object} [options] An object containing setting variables for the modal.
	 * @config {Function} [preOpen] A callback that runs before the modal window opens.
	 * @config {Function} [postOpen] A callback that runs after the modal window opens.
	 * @config {Function} [preClose] A callback that runs before the modal window closes.
	 * @config {Function} [postClose] A callback that runs after the modal window closes.
	 * @config {Function} [eventData] A callback returns a plain object containing data properties to pass to the `modalclose` event.
	 * @property {jQuery} obj A jQuery object to use as the active modal. This is a copy of the `obj` parameter.
	 * @property {jQuery} parent The parent jQuery object of `obj`. This is used to reset the placement of the DOM node after the modal closes.
	 * @property {HTMLElement} focused The DOM element that was focused before the modal opened. This element is refocused when the modal is closed.
	 */
	function Modal(obj, options) {
		options.obj = obj;
		options.parent = obj.parent();
		options.focused = document.activeElement;
		// TODO: Just use an `options` own-property.
		// This will prevent option parameters from overwriting
		// the prototype `open` and `close`
		$.extend(this, options);
		
		return this;
	}
	Modal.prototype = {
		/**
		 * Performs modal pre-processing, opens the specified modal DOM element,
		 * and finally performs modal post-processing.
		 *
		 * @returns {Modal} Chainable return object.
		 */
		open: function() {
			// Apply the preOpen function if it's specified.
			if ($.isFunction(this.preOpen)) {
				this.preOpen.apply(this.obj, arguments);
			}
			
			// Move the modal object to the document body (instead of wherever it was).
			// This helps with the stacking order to make sure that absolute/fixed position
			// elements don't pop up over the modal.
			$(document.body).append(this.obj);
			this.obj.after($shade);
			
			// Display the shade DOM object.
			$shade.show();
			// Display and center the specified modal.
			// Fire the `modalopen` event after everything is loaded.
			this.obj.css({
					marginTop: -this.obj.outerHeight() / 2,
					marginLeft: -this.obj.outerWidth() / 2
				}).show()
				.trigger(getEvent.call(this, 'modalopen'));
			
			// Focus the first available input in the opened modal.
			this.obj.find('input, select, textarea, button').first().focus();
			
			// Apply the postOpen function if it's specified.
			if ($.isFunction(this.postOpen)) {
				this.postOpen.apply(this.obj, arguments);
			}
			
			// Create a keydown listener for the ESC key to close the active modal.
			$(document).on('keydown.modal', function(e) {
				// Do I really want this? It's necessary in one of my applications...
				// But I don't know if it's just because I didn't design the events/DOM properly.
				e.stopPropagation();
				
				if (e.which == 27) { // ESC key closes the modal window.
					$.modal.close();
				}
			});
			
			return this;
		},
		
		/**
		 * Performs modal pre-processing, closes the active modal DOM element,
		 * and finally performs modal post-processing.
		 *
		 * @returns {Modal} Chainable return object.
		 */
		close: function() {
			// Apply the preClose function if it's specified.
			if ($.isFunction(this.preClose)) {
				this.preClose.apply(this.obj, arguments);
			}
			
			// Hide the shade DOM object.
			$shade.hide();
			// Hide the active modal and fire the `modalclose` event with
			// parameters obtained from the `eventData` option.
			this.obj.hide().trigger(getEvent.call(this, 'modalclose'));
			
			// Reposition the DOM element back under its original parent.
			this.parent.append(this.obj);
			// Focus the pre-modal focused element.
			// TODO: Do we care about preventing autoscroll here?
			$(this.focused).focus();
			// Clear the modal reference from the jQuery object.
			$.modal = null;
			
			// Apply the postClose function if it's specified.
			if ($.isFunction(this.postClose)) {
				this.postClose.apply(this.obj, arguments);
			}
			
			// Clear out the keydown listener for the ESC key.
			$(document).off('keydown.modal');
			
			return this;
		}
	};
	
	$.fn.extend({
		/**
		 * jQuery fn extension function to expose the internal `Modal` class and functionality.
		 *
		 * @param {Object} [options] An object containing setting variables for the modal.
		 * @config {Function} [preOpen] A callback that runs before the modal window opens.
		 * @config {Function} [postOpen] A callback that runs after the modal window opens.
		 * @config {Function} [preClose] A callback that runs before the modal window closes.
		 * @config {Function} [postClose] A callback that runs after the modal window closes.
		 * @config {Function} [eventData] A callback returns a plain object containing data properties to pass to the `modalclose` event.
		 * @returns {Modal} The `Modal` instance created for the jQuery object DOM element. Returns `undefined` if using an empty or non HTMLElement selector.
		 */
		modal: function(options) {
			obj = obj.first();
			options = options || {};
			
			// Check to see if there's actually an object.
			if (this.length === 1 && this[0].nodeType) {
				// Close all existing modals that were created with the minimodal plugin.
				if ($.modal instanceof Modal) {
					$.modal.close();
				}
				
				// Set the active modal and return it.
				return $.modal = new Modal(this, options).open();
			}
		}
	});
})(this, jQuery);