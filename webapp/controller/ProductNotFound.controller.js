sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";
  return Controller.extend(
    "com.saperp.m.manageproducts.controller.ProductNotFound",
    {
      onBackToHome: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteViewProdu");
      },
    }
  );
});
