try {
  gform.addFilter("gform_conditional_logic_operators", function(
    operators,
    objectType,
    fieldId
  ) {
    operators.inList = "inList";
    operators.notInList = "notInList";
    gf_vars["inList"] = "in csv";
    gf_vars["notInList"] = "not in csv";

    return operators;
  });

  gform.addFilter("gform_is_value_match", function(isMatch, formId, rule) {
    if (!rule || (rule.operator != "inList" && rule.operator != "notInList")) {
      return isMatch;
    }

    var fieldValues = advLog_get_field_values(formId, rule.fieldId);

    var ruleValues = rule.value
      .split(",")
      .map(function(value) {
        return value.trim();
      })
      .filter(function(entry) {
        return entry;
      });

    for (var i = 0; i < fieldValues.length; i++) {
      var theFieldVal = fieldValues[i];
      if (rule.operator == "inList") {
        if (ruleValues.includes(theFieldVal)) {
          return true;
        }
      } else if (rule.operator == "notInList") {
        if (ruleValues.includes(theFieldVal)) {
          return false;
        }
      }
    }

    return rule.operator == "inList" ? false : true;
  });

  function advLog_get_field_values(formId, rawFieldId) {
    var $ = jQuery,
      fieldId = gformExtractFieldId(rawFieldId),
      inputIndex = gformExtractInputIndex(fieldId),
      isInputSpecific = inputIndex !== false,
      $inputs,
      formattedValues = new Array(),
      values = new Array();

    if (isInputSpecific) {
      $inputs = $("#input_{0}_{1}_{2}".format(formId, fieldId, inputIndex));
    } else {
      $inputs = $(
        'input[id="input_{0}_{1}"], input[id^="input_{0}_{1}_"], input[id^="choice_{0}_{1}_"], select#input_{0}_{1}, textarea#input_{0}_{1}'.format(
          formId,
          fieldId
        )
      );
    }

    isCheckable = $.inArray($inputs.attr("type"), ["checkbox", "radio"]) !== -1;

    if (isCheckable) {
      $inputs.each(function() {
        var $input = jQuery(this);
        var theFieldValue = gf_get_value($input.val());

        // force an empty value for unchecked items
        if (!$input.is(":checked")) {
          theFieldValue = "";
          values.push("");
        }
        // if the 'other' choice is selected, get the value from the 'other' text input
        else if (fieldValue == "gf_other_choice") {
          theFieldValue = $(
            "#input_{0}_{1}_other".format(formId, fieldId)
          ).val();
        }
        values.push(theFieldValue);
      });
      //handle multiple values
    } else {
      // handle single values
      var val = gf_get_value($inputs.eq(0).val());
      values = val instanceof Array ? val : [val];
    }

    for (var i = 0; i < values.length; i++) {
      var hasLabel = values[i] ? values[i].indexOf("|") >= 0 : true,
        fieldValue = gf_get_value(values[i]);

      var fieldNumberFormat = gf_get_field_number_format(
        rawFieldId,
        formId,
        "value"
      );
      if (fieldNumberFormat && !hasLabel) {
        fieldValue = gf_format_number(fieldValue, fieldNumberFormat);
      }

      formattedValues.push(fieldValue);
    }

    return formattedValues;
  }
} catch (e) {}
