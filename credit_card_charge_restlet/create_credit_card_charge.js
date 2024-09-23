/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope Public
 */
define(['N/record'], function (record) {

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

    // Function called upon sending a GET request to retrieve a record
    function doGet(requestParams) {
        try {
            // Load the credit card charge record in dynamic mode
            var creditCardCharge = record.load({
                type: record.Type.CREDIT_CARD_CHARGE,
                id: requestParams.internalId,
                isDynamic: true
            });
    
            // Prepare the response object with all relevant fields
            var response = {
                internalId: creditCardCharge.id,
                entity: creditCardCharge.getValue('entity'),
                subsidiary: creditCardCharge.getValue('subsidiary'),
                account: creditCardCharge.getValue('account'),
                memo: creditCardCharge.getValue('memo'),
                trandate: creditCardCharge.getValue('trandate'),
                tranid: creditCardCharge.getValue('tranid'),
                location: creditCardCharge.getValue('location'),
                department: creditCardCharge.getValue('department'),
                class: creditCardCharge.getValue('class'),
                currency: creditCardCharge.getValue('currency'),
                externalid: creditCardCharge.getValue('externalid'),
                expenses: []
            };
    
            // Fetch the expense sublist lines
            var lineCount = creditCardCharge.getLineCount({ sublistId: 'expense' });
            for (var i = 0; i < lineCount; i++) {
                var expense = {
                    account: creditCardCharge.getSublistValue({ sublistId: 'expense', fieldId: 'account', line: i }),
                    amount: creditCardCharge.getSublistValue({ sublistId: 'expense', fieldId: 'amount', line: i }),
                    memo: creditCardCharge.getSublistValue({ sublistId: 'expense', fieldId: 'memo', line: i }),
                    department: creditCardCharge.getSublistValue({ sublistId: 'expense', fieldId: 'department', line: i }),
                    class: creditCardCharge.getSublistValue({ sublistId: 'expense', fieldId: 'class', line: i }),
                    location: creditCardCharge.getSublistValue({ sublistId: 'expense', fieldId: 'location', line: i }),
                    customer: creditCardCharge.getSublistValue({ sublistId: 'expense', fieldId: 'customer', line: i }),
                    isBillable: creditCardCharge.getSublistValue({ sublistId: 'expense', fieldId: 'isBillable', line: i }),
                    taxCode: creditCardCharge.getSublistValue({ sublistId: 'expense', fieldId: 'taxcode', line: i }),
                    taxAmount: creditCardCharge.getSublistValue({ sublistId: 'expense', fieldId: 'taxamount', line: i }),
                    customFields: {
                        custcolfyle_receipt_link: creditCardCharge.getSublistValue({
                            sublistId: 'expense',
                            fieldId: 'custcolfyle_receipt_link',
                            line: i
                        }),
                        custcolfyle_receipt_link_2: creditCardCharge.getSublistValue({
                            sublistId: 'expense',
                            fieldId: 'custcolfyle_receipt_link_2',
                            line: i
                        }),
                        custcolfyle_expense_url: creditCardCharge.getSublistValue({
                            sublistId: 'expense',
                            fieldId: 'custcolfyle_expense_url',
                            line: i
                        }),
                        custcolfyle_expense_url_2: creditCardCharge.getSublistValue({
                            sublistId: 'expense',
                            fieldId: 'custcolfyle_expense_url_2',
                            line: i
                        })
                    }
                };
    
                // Push the expense object to the response
                response.expenses.push(expense);
            }
    
            return response;
        } catch (e) {
            log.error('Error in doGet', e);
            return { success: false, message: e.message };
        }
    }    

    // Function called upon sending a PUT request to update a record
    function doPut(requestBody) {
        try {
            var creditCardCharge = record.load({
                type: record.Type.CREDIT_CARD_CHARGE,
                id: requestBody.internalId,
                isDynamic: true
            });

            creditCardCharge.setValue({ fieldId: 'memo', value: requestBody.memo });

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


        var expenses = requestBody.expenses

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