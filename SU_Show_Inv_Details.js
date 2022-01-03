	/**
	 * @NApiVersion 2.0
	 * @NScriptType Suitelet
	 * @NModuleScope SameAccount
	 */
	define(['N/render', 'N/record', 'N/format', 'N/search', 'N/config', 'N/xml', 'N/ui/serverWidget'],

		function(render, record, format, search, config, xml, serverWidget) {

			/**
			 * Definition of the Suitelet script trigger point.
			 *
			 * @param {Object} context
			 * @param {ServerRequest} context.request - Encapsulation of the incoming request
			 * @param {ServerResponse} context.response - Einncapsulation of the Suitelet response
			 * @Since 2015.2
			 */
			function onRequest(context) {

				log.debug('onRequest', 'Suitelet called successfully..');
				try { //
					var request = context.request;
					var response = context.response;
					//var currentRecord = context.currentRecord;

					var i_recordID = request.parameters.recordid;
					log.debug('onRequest', 'i_recordID :' + i_recordID);


					if(context.request.method === 'GET') {
						var form = serverWidget.createForm({
							title: 'Inventory Balance Sheet'
						});

						var o_recordObj = record.load({
							type: 'workorder',
							id: i_recordID
						});
						log.debug('onRequest', 'o_recordObj :' + o_recordObj);
						var lineCount = o_recordObj.getLineCount({
							sublistId: 'item'
						})
						log.debug('lineCount', lineCount)
						var recordArray = []
						var inventoryJson = [];
						var itemJson =[];
						for(var i = 0; i < lineCount; i++)

						{
							var createdInvId = o_recordObj.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_sipl_inv_transfer_ref',
								line: i
							})
							if(createdInvId) {
								var itemId = o_recordObj.getSublistValue({
									sublistId: 'item',
									fieldId: 'item',
									line: i
								})
								recordArray.push({
									"InvenotoryId": createdInvId,
									"itemId": itemId
								})
							}
						}
						log.debug('recordArray', recordArray)
						var result = []
						recordArray.forEach(function(a) {
							if(!this[a.InvenotoryId]) {
								this[a.InvenotoryId] = {
									InvenotoryId: a.InvenotoryId,
									itemId: '',

								};
								result.push(this[a.InvenotoryId]);
							}
							this[a.InvenotoryId].itemId += a.itemId + '*';
							
						}, Object.create(null));
						log.audit('result', result.length)
						for(var j = 0; j < result.length; j++) {
							var inverntoryRecObj = record.load({
								type: 'inventorytransfer',
								id: result[j].InvenotoryId,
								isDyanmic: true
							})
							log.debug('inverntoryRecObj', inverntoryRecObj)
							var totalItem = result[j].itemId
							var t_item = totalItem.split("*")
							log.debug('t_item', t_item)
							for(var ia=0;ia<t_item.length-1;ia++)
							{
								itemJson.push(t_item[ia])
							}
							var invLineCount = inverntoryRecObj.getLineCount({
								sublistId: 'inventory'
							})
							log.debug('invLineCount', invLineCount)
							for(x = 0; x < invLineCount; x++) {
								/*var matchValue = inverntoryRecObj.findSublistLineWithValue({sublistId:'inventory',fieldId:'item',value:t_item[x].itemId})
								log.debug('matchValue',matchValue)
								if(matchValue>0)*/
								{
									var subRec = inverntoryRecObj.getSublistSubrecord({
										sublistId: 'inventory',
										fieldId: 'inventorydetail',
										line: x
									})
									var i_irem_id = inverntoryRecObj.getSublistValue({
										sublistId: 'inventory',
										fieldId: 'item',
										line: x
									})
									log.debug('subRec', subRec)
									var inventoryLine = subRec.getLineCount({
										sublistId: 'inventoryassignment'
									});
									log.debug('inventoryLine', inventoryLine)
									var lot_no = ''
									var lot_qty = '';
									for(var iv = 0; iv < inventoryLine; iv++) {
										var lotNo = subRec.getSublistText({
											sublistId: 'inventoryassignment',
											fieldId: 'issueinventorynumber',
											line: iv // I know this is the serial number record internal ID for my test
										});
										log.debug('lotNo', lotNo)
										lot_no += lotNo + ","
										var invQty = subRec.getSublistValue({
											sublistId: 'inventoryassignment',
											fieldId: 'quantity',
											line: iv //Again I know this so hard coded for testing
										});
										log.debug('invQty', invQty)
										lot_qty += invQty + ","
									}
									inventoryJson.push({
										"record_id": result[j].InvenotoryId,
										"lotNo": lot_no,
										"Qty": lot_qty,
										"itemId": i_irem_id
									})
								}
							}
						}
						log.debug('inventoryJson', inventoryJson)
						log.debug('itemJson',itemJson)

						/*var field = form.addField({
							id: 'custpage_text',
							type: serverWidget.FieldType.TEXT,
							label: 'Text'
						});*/
						form.addSubmitButton({
							id: 'buttonid',
							label: 'Submit',

						});
						var sublist = form.addSublist({
							id: 'custpage_sublistgrp',
							type: serverWidget.SublistType.INLINEEDITOR,
							label: 'Inventory Details'
						});
						var sub_reecord_id = sublist.addField({
							id: 'custpage_sub_record_id',
							label: 'Transaction',
							type: serverWidget.FieldType.SELECT,
							source: 'transaction'
						});
						var custom_item = sublist.addField({
							id: 'custpage_sub_item',
							label: 'Item',
							type: serverWidget.FieldType.SELECT,
							source:'item'
						});
						var sub_lot_no = sublist.addField({
							id: 'custpage_sub_lot_no',
							label: 'Lot No',
							type: serverWidget.FieldType.TEXT,
							
						});
						var sub_qty = sublist.addField({
							id: 'custpage_sub_qty',
							label: 'Quantity',
							type: serverWidget.FieldType.TEXT,
							
						});
						
						for(var i=0;i<inventoryJson.length;i++)
						{
							//log.debug('enter')
							var retunItem = returnMatchItem(inventoryJson[i], itemJson)
							log.debug('retunItem',retunItem)
							
							var ltNo =inventoryJson[i].lotNo 
							var ltQty = inventoryJson[i].Qty
							sublist.setSublistValue({id: 'custpage_sub_record_id',line: i,value: inventoryJson[i].record_id});
							sublist.setSublistValue({id: 'custpage_sub_item',line: i,value: inventoryJson[i].itemId});
							sublist.setSublistValue({id: 'custpage_sub_lot_no',line: i,value: ltNo.substring(0, ltNo.length - 1)});
							sublist.setSublistValue({id: 'custpage_sub_qty',line: i,value: ltQty.substring(0, ltQty.length - 1)});
							
						}
						context.response.writePage(form)
					}
				}
				catch (e) {
					var errString = 'onRequest ' + e.name + ' : ' + e.type + ' : ' + e.message;
					log.error({
						title: 'onRequest',
						details: errString
					});

					//throw new Error('DEBUG', 'Error occured while submitting record: '+ e.message);
				}
			}
			return {
				onRequest: onRequest
			};

			function _logValidation(value) {
				if(value != 'null' && value != null && value != null && value != '' && value != undefined && value != undefined && value != 'undefined' && value != 'undefined' && value != 'NaN' && value != NaN) {
					return true;
				}
				else {
					return false;
				}
			}
function  returnMatchItem(Project_Number, itemJson)
		{
			
			var id = JSON.parse(JSON.stringify(Project_Number));
			log.audit('in id',id.itemId);
			var formatJsonData=[]
			for(var i = 0; i < itemJson.length; i++) {
				//log.debug('id[i].projectId',id[i].projectId)
				if(id.itemId === itemJson[i]) {
					formatJsonData.push({
									"record_id": id.record_id,
									"itemId": id.itemId,
									"lotNo": id.lotNo,
									"Qty": id.Qty
								})
					
					return formatJsonData;//id[i];
				}

			
		}
		return formatJsonData
		}


		});