/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget','N/record','N/url'],

		function(serverWidget,record,url) {

	/**
	 * Function definition to be triggered before record is loaded.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {string} scriptContext.type - Trigger type
	 * @param {Form} scriptContext.form - Current form
	 * @Since 2015.2
	 */
	function beforeLoad_addButton(scriptContext) {

		var s_type = scriptContext.type; // type == create,view edit
		log.debug('beforeLoad','s_type :'+s_type);

		var o_recordObj = scriptContext.newRecord;
		log.debug('beforeLoad','o_recordObj :'+o_recordObj);

		if(s_type == 'create'){
			var s_recordType = o_recordObj.type;
			log.debug('beforeLoad','s_recordType :'+s_recordType);

			var i_recordID = o_recordObj.getValue({fieldId:'createdfrom'});
			log.debug('beforeLoad','i_recordID :'+i_recordID);
			
			
			if(s_recordType=='workorderissue')
            {
				var createPdfUrl = url.resolveScript({
					scriptId: 'customscript_sil_show_inv_details',
					deploymentId: 'customdeploy_sil_show_inv_details',
					returnExternalUrl: false
				});
				createPdfUrl += '&recordid=' + i_recordID;

				var form = scriptContext.form;
				form.addButton
				({
					id : 'custpage_order_acceptance_pdf',
					label:'Inv Details',			    		
					functionName: "window.open('" + createPdfUrl + "');"
				});

			}
		}
		

	}

	

	/**
	 * Function definition to be triggered before record is loaded.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @param {string} scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function afterSubmit(scriptContext) {


	}

	return {
		beforeLoad: beforeLoad_addButton,
		//beforeSubmit: beforeSubmit,
		//afterSubmit: afterSubmit
	};

});