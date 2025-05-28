/*global QUnit*/

sap.ui.define([
	"com/saperp/m/manageproducts/controller/ViewProdu.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ViewProdu Controller");

	QUnit.test("I should test the ViewProdu controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
