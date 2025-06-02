sap.ui.define(
  ["sap/ui/core/mvc/Controller", "com/saperp/m/manageproducts/model/formatter"],
  function (Controller, formatter) {
    "use strict";

    return Controller.extend("com.saperp.m.manageproducts.controller.Product", {
      formatter: formatter,
      onInit: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("RouteProduct")
          .attachPatternMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function (oEvent) {
        var sProductId = oEvent.getParameter("arguments").productId;
        var oView = this.getView();
        oView.bindElement({
          path: "/Products(" + sProductId + ")",
          parameters: {
            expand: "Supplier, Category",
          },
          events: {
            change: this._onBindingChange.bind(this),
            dataRequested: function () {
              oView.setBusy(true);
            },
            dataReceived: function (oEvent) {
              oView.setBusy(false);
            },
          },
        });
      },

      _onBindingChange: function () {
        var oView = this.getView();
        var oElementBinding = oView.getElementBinding();
        if (!oElementBinding.getBoundContext()) {
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteProductNotFound");
        }
      },
    });
  }
);
