/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope Public
 */
define(['N/record'],
/**
 * @param {record} record
 */
function (record) {
    /**
     * Function called upon sending a POST request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a
     * string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json'
     * (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain';
     * return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) {
        var creditCardRefund = CreateNetSuiteCreditCardRefund(requestBody);
        if (creditCardRefund.success) {
            log.debug('CCC', creditCardRefund);
            return creditCardRefund;
        } else {
            log.debug('CCC refund', 'Fail');
            return creditCardRefund;
        }
    }

    function CreateNetSuiteCreditCardRefund(requestBody) {
        log.debug('Post body', requestBody);
        log.debug(record.Type.CREDIT_CARD_REFUND);
        var creditCardRefund = record.create({
            type: record.Type.CREDIT_CARD_REFUND,
            isDynamic: true
        });

        creditCardRefund.setValue({ fieldId: 'entity', value: requestBody.entity.internalId });
        creditCardRefund.setValue({ fieldId: 'subsidiary', value: requestBody.subsidiary.internalId });
        creditCardRefund.setValue({ fieldId: 'account', value: requestBody.account.internalId });
        creditCardRefund.setValue({ fieldId: 'trandate', value: new Date(requestBody.tranDate) });
        creditCardRefund.setValue({ fieldId: 'tranid', value: requestBody.tranid });
        creditCardRefund.setValue({ fieldId: 'location', value: requestBody.location.internalId });
        creditCardRefund.setValue({ fieldId: 'department', value: requestBody.department.internalId });
        creditCardRefund.setValue({ fieldId: 'currency', value: requestBody.currency.internalId });
        creditCardRefund.setValue({ fieldId: 'memo', value: requestBody.memo });
        creditCardRefund.setValue({ fieldId: 'externalid', value: requestBody.externalId });


        creditCardRefund.selectNewLine({
            sublistId: 'expense'
        });


        var expenses = requestBody.expenses

        expenses.forEach(function (expense) {
            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'account',
                value: expense.account.internalId
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'amount',
                value: expense.amount
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'memo',
                value: expense.memo
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'department',
                value: expense.department.internalId
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'class',
                value: expense.class.internalId
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'location',
                value: expense.location.internalId
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'customer',
                value: expense.customer.internalId
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'isbillable',
                value: expense.isBillable
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'taxcode',
                value: expense.taxCode.internalId
            });

            creditCardRefund.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'taxamount',
                value: expense.taxAmount
            });

            expense.customFieldList.forEach(function (customField) {
                creditCardRefund.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: customField.scriptId,
                    value: customField.value
                });
            });

            creditCardRefund.commitLine({
                sublistId: 'expense'
            });

        });
        log.debug('ccc_refund', creditCardRefund);
        var id = creditCardRefund.save({});
        log.debug('record save with id', id);

        return { internalId: id, success: true };
    }

    return {
        'post': doPost,
    };

});