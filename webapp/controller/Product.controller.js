sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("com.saperp.m.manageproducts.controller.Product", {
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
          expand: "Supplier",
        },
      });
    },
  });
});
