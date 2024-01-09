sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"raizencmv/model/models",
	"raizencmv/utils/FioriComponentHelper",
	"raizencmv/utils/jszip",
	"raizencmv/utils/xlsx"
 
], function(UIComponent, Device, models, FioriComponent, jszip, xlsx) {
	"use strict";


	return UIComponent.extend("raizencmv.Component", {

		metadata: {
			
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			// set the FLP model
			// this.setModel(models.createFLPModel(), "FLP");
			// create the views based on the url/hash
			// this.getRouter().initialize();
			
	
		},
		createContent: function() {
			//sets component
			FioriComponent.setComponent(this);
			// create root view
			var view = sap.ui.view({
				id: this.createId("App"),
				viewName: "raizencmv.view.App",
				type: "XML",
				viewData: {
					component: this
				}
			});

			return view;
		}
	});
});