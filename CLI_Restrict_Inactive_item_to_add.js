define(['N/record', 'N/search', 'N/ui/dialog', 'N/log'], function(record, search, dialog, log) {
	/**
	 *@NApiVersion 2.0
	 *@NScriptType ClientScript
	 */

	function pageInit(context) {
		var currentRecord = context.currentRecord;

		var firstName = currentRecord.getValue({
			fieldId: 'firstname'
		});
		log.debug({
			title: 'Customer First Name',
			details: firstName
		});

		dialog.alert({
			title: 'Announcement',
			message: 'You are viewing ' + firstName
		});

		currentRecord.setValue({
			fieldId: 'comments',
			value: 'Use this area for any customer comments.'
		});
	}

	function fieldChanged(context) {
		var currentRecord = context.currentRecord;

		if(context.fieldId == 'title') {
			var jobTitle = currentRecord.getValue({
				fieldId: 'title'
			});

			dialog.alert({
				title: 'Job Title Change',
				message: 'Job Title has changed to ' + jobTitle
			});
		}
	}

	function saveRecord(context) {
		try {
			var currentRecord = context.currentRecord;
			var comments = currentRecord.getValue({
				fieldId: 'comments'
			});
			log.debug('comments', comments)
			var itemArray = []
			var lineCount = currentRecord.getLineCount({
				sublistId: 'item'
			})
			log.debug('lineCount', lineCount)
			for(var i = 0; i < lineCount; i++) {

				var check_box = currentRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'itemreceive',
					line: i
				})
				log.debug('check_box', check_box)
				if(check_box == true || check_box == 'true' || check_box == 'T') {
					var item_id = currentRecord.getSublistValue({
						sublistId: 'item',
						fieldId: 'item',
						line: i
					})
					log.debug('item_id', item_id)
					itemArray.push(item_id)
				}

			}
			log.debug('itemArray', itemArray)
			var checkId = checkItem_acitive(itemArray)
			log.debug('checkId', checkId)
			// if the check id is greator then zero that means item is inactive
			var id = 'hello';
			if(checkId.length > 0) {
				if(checkId[0]) {
					dialog.alert({
						title: 'Inactive item',
						message: 'You can not save the record because below items are inactive  '+checkId
					});
					return false;
				}
				else {
					return true;
				}

			}
			else {
				return true;
			}

			i

		}
		catch (ex) {
			log.error({
				title: ' on save Record',
				details: 'ex,name' + ex.name + 'ex.message' + ex.message + 'ex.type ' + ex.type
			});
		}

	}


	function checkItem_acitive(itemArray) {
		var item_arr = []
		var itemSearchObj = search.create({
			type: "item",
			filters: [
				["type", "anyof", "Assembly", "InvtPart", "NonInvtPart", "Description", "Discount", "Group", "Kit", "Markup", "OthCharge", "Payment", "Service", "Subtotal"],
				"AND",
				["isinactive", "is", "T"],
				"AND",
				["internalid", "anyof", itemArray]
			],
			columns: [
				search.createColumn({
					name: "isinactive",
					label: "Inactive"
				}),
				search.createColumn({
					name: "internalid",
					label: "Internal ID"
				}),
				search.createColumn({
         name: "itemid",
         sort: search.Sort.ASC,
         label: "Name"
      })
			]
		});
		var searchResultCount = itemSearchObj.runPaged()
			.count;
		log.debug("itemSearchObj result count", searchResultCount);
		itemSearchObj.run()
			.each(function(result) {
				item_arr.push(result.getValue({
					name: "itemid",
         sort: search.Sort.ASC,
         label: "Name"
				}))
				// .run().each has a limit of 4,000 results
				return true;
			});
		return item_arr
	}
	return {
		//  pageInit: pageInit,
		// fieldChanged: fieldChanged,
		saveRecord: saveRecord
	}

});