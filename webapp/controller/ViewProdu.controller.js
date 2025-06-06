sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "com/saperp/m/manageproducts/model/formatter",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
  ],
  (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    formatter,
    Device,
    Fragment
  ) => {
    "use strict";

    return Controller.extend(
      "com.saperp.m.manageproducts.controller.ViewProdu",
      {
        formatter: formatter,
        ITEMS_PER_PAGE: 5,

        onInit() {
          this.iSkip = 0;
          this.oViewModel = new JSONModel({
            includeSupplier: true,
            searchVisible: true,
            rangeText: "Affichage de 0-0 sur 0 éléments",
            currentPage: 1,
            totalPages: 1,
            prevEnabled: false,
            nextEnabled: false,
            selectedProducts: {},
            isPortrait: Device.orientation.portrait,
          });
          this.getView().setModel(this.oViewModel, "viewModel");
          this.rebindTable();

          //Listen for orientation changes
          Device.orientation.attachHandler(this.onOrientationChange.bind(this));
        },

        isSelected(sId) {
          const oSelectedProducts =
            this.oViewModel.getProperty("/selectedProducts") || {};
          return !!oSelectedProducts[sId];
        },

        rebindTable(aFilters = []) {
          const oTable = this.byId("productsTable");
          const oTemplate = oTable.getBindingInfo("items").template;
          oTable.bindItems({
            path: "/Products",
            template: oTemplate,
            parameters: {
              expand: "Supplier/Name",
              top: this.ITEMS_PER_PAGE,
              skip: this.iSkip,
              $inlinecount: "allpages",
            },
            filters: aFilters,
            events: {
              dataRequested: () => {
                oTable.setBusy(true);
              },
              dataReceived: (oData) => {
                oTable.setBusy(false);
              },
            },
          });

          const oBinding = oTable.getBinding("items");
          if (oBinding) {
            oBinding.attachEventOnce("dataReceived", (oEvent) => {
              const oData = oEvent.getParameter("data");
              if (!oData) {
                console.error("Erreur lors du chargement des données");
                return;
              }
              const iTotalCount = parseInt(oData.__count, 10) || 0;
              const iTotalPages =
                Math.ceil(iTotalCount / this.ITEMS_PER_PAGE) || 1;
              const iCurrentPage =
                Math.floor(this.iSkip / this.ITEMS_PER_PAGE) + 1;
              const iStart = this.iSkip + 1;
              const iEnd = Math.min(
                this.iSkip + this.ITEMS_PER_PAGE,
                iTotalCount
              );

              this.oViewModel.setProperties({
                rangeText: `Affichage de ${iStart}-${iEnd} sur ${iTotalCount} éléments`,
                currentPage: iCurrentPage,
                totalPages: iTotalPages,
                prevEnabled: this.iSkip > 0,
                nextEnabled: this.iSkip + this.ITEMS_PER_PAGE < iTotalCount,
              });
            });
          }
        },

        onCheckboxSelect(oEvent) {
          const oCheckBox = oEvent.getSource();
          const sProductId = oCheckBox.getBindingContext().getProperty("ID");
          const bSelected = oEvent.getParameter("selected");
          const oSelectedProducts =
            this.oViewModel.getProperty("/selectedProducts") || {};
          oSelectedProducts[sProductId] = bSelected;
          this.oViewModel.setProperty("/selectedProducts", oSelectedProducts);
        },

        onLiveSearch(oEvent) {
          this.iSkip = 0;
          const sQuery = oEvent.getSource().getValue().trim();
          const aFilters = sQuery
            ? [
                new Filter({
                  filters: [
                    new Filter("Name", FilterOperator.Contains, sQuery),
                    new Filter("Description", FilterOperator.Contains, sQuery),
                  ],
                  and: false,
                }),
              ]
            : [];
          this.rebindTable(aFilters);
        },

        onNextPage() {
          this.iSkip += this.ITEMS_PER_PAGE;
          this.rebindTable(this.getCurrentFilters());
        },

        onPreviousPage() {
          this.iSkip = Math.max(this.iSkip - this.ITEMS_PER_PAGE, 0);
          this.rebindTable(this.getCurrentFilters());
        },

        getCurrentFilters() {
          const sQuery = this.byId("searchField").getValue().trim();
          return sQuery
            ? [
                new Filter({
                  filters: [
                    new Filter("Name", FilterOperator.Contains, sQuery),
                    new Filter("Description", FilterOperator.Contains, sQuery),
                  ],
                  and: false,
                }),
              ]
            : [];
        },

        onSupplierToggle(oEvent) {
          this.oViewModel.setProperty(
            "/includeSupplier",
            oEvent.getSource().getSelected()
          );
        },

        onOrientationChange(oEvent) {
          this.oViewModel.setProperty("/isPortrait", oEvent.portrait);
        },

        onBeforeRendering() {
          // Update the view model with the current orientation
          this.oViewModel.setProperty(
            "/isPortrait",
            Device.orientation.portrait
          );
        },

        onExit() {
          // Detach orientation change handler to avoid memory leaks
          Device.orientation.detachHandler(this.onOrientationChange, this);
        },

        onProductClick(oEvent) {
          var oContext = oEvent.getSource().getBindingContext();
          var sProductId = oContext.getProperty("ID");
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteProduct", {
            productId: sProductId,
          });
        },

        getCurrentFilters: function () {
          var sQuery = this.byId("searchField").getValue().trim();
          return sQuery
            ? [
                new sap.ui.model.Filter({
                  filters: [
                    new sap.ui.model.Filter(
                      "Name",
                      sap.ui.model.FilterOperator.Contains,
                      sQuery
                    ),
                    new sap.ui.model.Filter(
                      "Description",
                      sap.ui.model.FilterOperator.Contains,
                      sQuery
                    ),
                  ],
                  and: false,
                }),
              ]
            : [];
        },
        onPressRefresh: () => {
          var oTable = this.byId("productsTable");
          oTable.setBusy(true);
          this.rebindTable(this.getCurrentFilters());
          var oBinding = oTable.getBinding("items");
          oBinding.attachEventOnce("dataReceived", () => {
            oTable.setBusy(false);
          });
        },

        onPressDeleteProduct: function (oEvent) {
          let oButton = oEvent.getSource();
          let oContext = oButton.getBindingContext();
          if (oContext) {
            Fragment.load({
              id: "deleteProductDialog",
              name: "com.saperp.m.manageproducts.view..fragment.ConfirmDeleteProduct",
              controller: this,
            }).then((oDialog) => {
              this.getView().addDependent(oDialog);
              oDialog.setBindingContext(oContext);
              oDialog.open();
            });
          }
        },
        onConfirmDeleteProduct: function (oEvent) {
          let oDialog = oEvent.getSource();
          let oContext = oDialog.getBindingContext();
          if (oContext) {
            let sProductId = oContext.getProperty("ID");
            // Call the delete function here, e.g., using a model
            // this.getView().getModel().remove("/Products(" + sProductId + ")");
            console.log("Deleting product with ID:", sProductId);
            // After deletion, you might want to refresh the table
            this.rebindTable(this.getCurrentFilters());
          }
          oDialog.close();
        },
        onCancelDeleteProduct: function (oEvent) {
          let oDialog = oEvent.getSource();
          oDialog.close();
        },
      }
    );
  }
);
