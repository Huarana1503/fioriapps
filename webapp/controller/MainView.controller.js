sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"raizencmv/model/AppJsonModel",
	"raizencmv/utils/jszip",
	"raizencmv/utils/xlsx",
	"sap/m/MessageBox",
	"raizencmv/services/Services",
	"sap/ui/unified/DateTypeRange",
	"sap/m/MessageToast",

], function(Controller, AppJsonModel, jszip, xlsx, MessageBox, Services, DateTypeRange, MessageToast) {
	"use strict";

	return Controller.extend("raizencmv.controller.MainView", {

		onInit: function() {
			AppJsonModel.initializeModel();

			var that = this;
			
				var oDatosProveedores = {
				Data: [{
					"Key": "30700834979",
					"Name": "TRAFIGURA ARGENTINA SA"
				}, {
					"Key": "30546689979",
					"Name": "YPF SOCIEDAD ANONIMA"
				}, {
					"Key": "30526552659",
					"Name": "PAMPA ENERGIA S A"
				}]
			};
			
		    debugger;
			var oNewModel = new sap.ui.model.json.JSONModel(oDatosProveedores.Data);
			this.getView().setModel(oNewModel, "ProveedoresModel");
			
		},
		onTokenUpdate: function(oEvent) {
        var sType = oEvent.getParameter("type");
        if (sType === "removed") {
            var sKey = oEvent.getParameter("removedTokens")[0].getProperty("key");
            var oModel = this.getView().getModel("ProveedoresModel");
            var aData = this.getView().getModel("ProveedoresModel").getProperty("/data");
            for (var i = 0, len = aData.length; i < len; i++) {
                var idx;
                console.log(sKey + "-" + aData[i].key);
                if (aData[i].key === sKey) {
                    idx = i;
                }
            }
            aData.splice(idx, 1);
            oModel.setProperty("/data", aData);
            console.log(oModel);
        }
    },
		onBack: function() {
			history.go(-1);

		},

		onGuardar: function() {

			var array = this.byId("DP10").getValue();

			var Periodo = {
				Periodo: array
			}

			if (array === "") {

				MessageBox.error("Antes de Guardar debe Ingresar una Fecha");

			} else {

				this._oDialog = new sap.m.BusyDialog({
					text: 'Cargando datos...'
				});

				this._oDialog.open();

				const cmvList = AppJsonModel.getProperty("/cmvList");
				cmvList.push(Periodo);

				Services.postData({
					Value: "C",
					CMVSet: cmvList

				}).then(aData => {

					sap.m.MessageToast.show(this.geti18nText("okUpload"))
					this._oDialog.close();
					//AppJsonModel.setProperty("/AjusteBSList", [])
				
				    AppJsonModel.initializeModel();
				    
				 

				}).catch(oErr => {
					MessageBox.error(this.geti18nText("errorUpload"))
					this._oDialog.close();
				})
			}
		},

		fnReplaceAjusteBS: function(oTable) {

			for (var i in oTable) {

				var columns = {};
				// columns['Periodo'] = oTable[i]['Periodo Calendario'].toString();
				columns['CEBE'] = oTable[i]['CEBE'] ? oTable[i]['CEBE'].toString() : undefined;
				columns['Centro'] = oTable[i]['Centro'];
				columns['Grupo'] = oTable[i]["Grupo artículos"]
				columns['Material'] = oTable[i]['Material'];
				columns['CMVUnit'] = oTable[i]['CMV Unit'].toString();
				columns['OtrosCostos'] = oTable[i]['Otros Costos'];
				columns
				oTable[i] = columns;
			}
			return oTable;
		},

		fileReader1: function(oFile) {

			var that = this;
			var excelajusteBS = {};
			const oLabel = this.getView().byId("idLabelRegistros")

			var reader = new FileReader();

			reader.onload = function(oEvent) {
				var data = oEvent.target.result;

				var workbook = XLSX.read(data, {
					type: 'binary'
				});

				workbook.SheetNames.forEach(function(sheetName) {

					switch (sheetName) {
						case workbook.SheetNames[0]:
							excelajusteBS = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
							break;
						default:
							// code block
					}
				});

				if (excelajusteBS) {

					var excelajusteBSRe = that.fnReplaceAjusteBS(excelajusteBS);

					let cmvList = AppJsonModel.getProperty("/cmvList")
					cmvList = cmvList.concat(excelajusteBSRe)
					AppJsonModel.setProperty("/cmvList", cmvList)
					oLabel.setText(that.geti18nText("registros", [cmvList.length]));
				}

				reader.onerror = function(ex) {
					console.log(ex);
				};
			};

			reader.readAsBinaryString(oFile);
		},

		onUploadFile: function(oEvent) {
			this.fileReader1(oEvent.getParameter("files") && oEvent.getParameter("files")[0]);
		},

		geti18nText: function(sText, aVariables = []) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sText, aVariables);
		},
	});
});