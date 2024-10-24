/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope Public
 */
define(['N/record', 'N/search'], function (record, search) {

    // Function called upon sending a POST request to create a new credit card charge record
    function doPost(requestBody) {
        var creditCardCharge = CreateNetSuiteCreditCardCharge(requestBody);
        if (creditCardCharge.success) {
            log.debug('CCC', creditCardCharge);
            return creditCardCharge;
        } else {
            log.debug('CCC', 'Fail');
            return creditCardCharge;
        }
    }

    // Function called upon sending a GET request to retrieve a record and system notes
    function doGet(requestParams) {
        try {
            var creditCardCharge = record.load({
                type: record.Type.CREDIT_CARD_CHARGE,
                id: requestParams.internalId,
                isDynamic: true
            });

            var systemNotes = getSystemNotes(requestParams);

            return {
                creditCardCharge: creditCardCharge,
                systemNotes: systemNotes
            }
        } catch (e) {
            log.error('Error in doGet', e);
            return { success: false, message: e.message };
        }
    }
    
    // Function to get system notes for a specific record
    function getSystemNotes(params) {
        var systemNotesSearch = search.create({
            type: record.Type.CREDIT_CARD_CHARGE, // Adjust based on record type, could be 'customer', etc.
            filters: [
                ['internalid', 'is', params.internalId],
                'AND',
                ['systemnotes.date', 'onorafter', params.fromDate || '1/1/2018'] // Adjust default date as needed
            ],
            columns: [
                search.createColumn({ name: 'date', join: 'systemNotes' }),
                search.createColumn({ name: 'field', join: 'systemNotes' }),
                search.createColumn({ name: 'newvalue', join: 'systemNotes' }),
                search.createColumn({ name: 'oldvalue', join: 'systemNotes' }),
                search.createColumn({ name: 'context', join: 'systemNotes' }),
                search.createColumn({ name: 'name', join: 'systemNotes' }) // Correct column for 'set by'
            ]
        });
    
        var searchResults = [];
        systemNotesSearch.run().each(function (result) {
            searchResults.push({
                Date: result.getValue({ name: 'date', join: 'systemNotes' }),
                Field: result.getValue({ name: 'field', join: 'systemNotes' }),
                NewValue: result.getValue({ name: 'newvalue', join: 'systemNotes' }),
                OldValue: result.getValue({ name: 'oldvalue', join: 'systemNotes' }),
                Context: result.getValue({ name: 'context', join: 'systemNotes' }),
                SetBy: result.getText({ name: 'name', join: 'systemNotes' }) // Use 'name' for the user who made the change
            });
            return true; // Continue the search
        });
    
        return searchResults;
    }

    // Function called upon sending a PUT request to update a record
    function doPut(requestBody) {
        try {
            var creditCardCharge = record.load({
                type: record.Type.CREDIT_CARD_CHARGE,
                id: requestBody.internalId,
                isDynamic: true
            });

            if (requestBody.entity) { creditCardCharge.setValue({ fieldId: 'entity', value: requestBody.entity.internalId }); }
            if (requestBody.account) { creditCardCharge.setValue({ fieldId: 'account', value: requestBody.account.internalId }); }
            if (requestBody.tranDate) {creditCardCharge.setValue({ fieldId: 'trandate', value: new Date(requestBody.tranDate) }); }
            if (requestBody.tranid) { creditCardCharge.setValue({ fieldId: 'tranid', value: requestBody.tranid }); }
            if (requestBody.location) { creditCardCharge.setValue({ fieldId: 'location', value: requestBody.location.internalId }); }
            if (requestBody.department) { creditCardCharge.setValue({ fieldId: 'department', value: requestBody.department.internalId }); }
            if (requestBody.class) { creditCardCharge.setValue({ fieldId: 'class', value: requestBody.class.internalId }); }
            if (requestBody.currency) { creditCardCharge.setValue({ fieldId: 'currency', value: requestBody.currency.internalId }); }
            if (requestBody.memo) { creditCardCharge.setValue({ fieldId: 'memo', value: requestBody.memo }); }
            if (requestBody.externalId) { creditCardCharge.setValue({ fieldId: 'externalid', value: requestBody.externalId }); }

            // First, remove existing expense lines
            var expenseLineCount = creditCardCharge.getLineCount({ sublistId: 'expense' });
            for (var i = expenseLineCount - 1; i >= 0; i--) {
                creditCardCharge.removeLine({ sublistId: 'expense', line: i });
            }

            // Add the new expense lines
            var expenses = requestBody.expenses;
            expenses.forEach(function (expense) {
                creditCardCharge.selectNewLine({ sublistId: 'expense' });

                creditCardCharge.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'account',
                    value: expense.account.internalId
                });

                creditCardCharge.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'amount',
                    value: expense.amount
                });

                creditCardCharge.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'memo',
                    value: expense.memo
                });

                creditCardCharge.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'department',
                    value: expense.department.internalId
                });

                creditCardCharge.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'class',
                    value: expense.class.internalId
                });

                creditCardCharge.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'location',
                    value: expense.location.internalId
                });

                creditCardCharge.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'customer',
                    value: expense.customer.internalId
                });

                creditCardCharge.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'isbillable',
                    value: expense.isBillable
                });

                creditCardCharge.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'taxcode',
                    value: expense.taxCode.internalId
                });

                creditCardCharge.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'taxamount',
                    value: expense.taxAmount
                });

                expense.customFieldList.forEach(function (customField) {
                    creditCardCharge.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: customField.scriptId,
                        value: customField.value
                    });
                });

                creditCardCharge.commitLine({ sublistId: 'expense' });
            });

            var id = creditCardCharge.save();
            return { internalId: id, success: true };

        } catch (e) {
            log.error('Error in doPut', e);
            return { success: false, message: e.message };
        }
    }

    function CreateNetSuiteCreditCardCharge(requestBody) {
        log.debug('Post body', requestBody);
        log.debug(record.Type.CREDIT_CARD_CHARGE);
        var creditCardCharge = record.create({
            type: record.Type.CREDIT_CARD_CHARGE,
            isDynamic: true
        });

        creditCardCharge.setValue({ fieldId: 'entity', value: requestBody.entity.internalId });
        creditCardCharge.setValue({ fieldId: 'subsidiary', value: requestBody.subsidiary.internalId });
        creditCardCharge.setValue({ fieldId: 'account', value: requestBody.account.internalId });
        creditCardCharge.setValue({ fieldId: 'trandate', value: new Date(requestBody.tranDate) });
        creditCardCharge.setValue({ fieldId: 'tranid', value: requestBody.tranid });
        creditCardCharge.setValue({ fieldId: 'location', value: requestBody.location.internalId });
        creditCardCharge.setValue({ fieldId: 'department', value: requestBody.department.internalId });
        creditCardCharge.setValue({ fieldId: 'class', value: requestBody.class.internalId });
        creditCardCharge.setValue({ fieldId: 'currency', value: requestBody.currency.internalId });
        creditCardCharge.setValue({ fieldId: 'memo', value: requestBody.memo });
        creditCardCharge.setValue({ fieldId: 'externalid', value: requestBody.externalId });


        creditCardCharge.selectNewLine({
            sublistId: 'expense'
        });

        var expenses = requestBody.expenses;

        expenses.forEach(function (expense) {
            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'account',
                value: expense.account.internalId
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'amount',
                value: expense.amount
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'memo',
                value: expense.memo
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'department',
                value: expense.department.internalId
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'class',
                value: expense.class.internalId
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'location',
                value: expense.location.internalId
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'customer',
                value: expense.customer.internalId
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'isbillable',
                value: expense.isBillable
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'taxcode',
                value: expense.taxCode.internalId
            });

            creditCardCharge.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'taxamount',
                value: expense.taxAmount
            });

            expense.customFieldList.forEach(function (customField) {
                creditCardCharge.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: customField.scriptId,
                    value: customField.value
                });
            });

            creditCardCharge.commitLine({
                sublistId: 'expense'
            });

        });
        log.debug('ccc_charge', creditCardCharge);
        var id = creditCardCharge.save({});
        log.debug('record save with id', id);

        return { internalId: id, success: true };
    }

    // Return the RESTlet methods for each HTTP method
    return {
        'get': doGet,
        'post': doPost,
        'put': doPut
    };

});