import React, { useContext, useState } from "react";
import { TextArea, Select, SelectItem, Toggle } from "carbon-components-react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { I18nProvider } from "../../i18n/I18nProvider";
import SideBarPanel from "../../SideBarPanel/components/SideBarPanel";
import "../styles/DrugChartNoteAcknowledgementSlider.scss";
import { SaveAndCloseButtons } from "../../SaveAndCloseButtons/components/SaveAndCloseButtons";
import { SliderContext } from "../../../context/SliderContext";
import { IPDContext } from "../../../context/IPDContext";
import { timeFormatFor24Hr, timeFormatFor12Hr, timeText24, timeText12 } from "../../../constants";
import { saveMedicationAmendmentNote } from "../../DisplayControls/DrugChart/utils/DrugChartUtils";
import { DatePickerCarbon, TimePicker24Hour, TimePicker } from "bahmni-carbon-ui";
import moment from "moment";

const DrugChartNoteAcknowledgementSlider = (props) => {
  const { hostData, hostApi } = props;
  const { config, handleAuditEvent } = useContext(IPDContext);
  const { setSliderContentModified } = useContext(SliderContext);

  // Get amendment reasons from config or use defaults
  // const { drugChartNoteAmendment = {} } = config;
  // const amendmentReasons = drugChartNoteAmendment.amendmentReasons || [
  //   "Incorrect Time",
  //   "Incorrect Dose",
  //   "Incorrect Unit",
  //   "Other"
  // ];

  const { enable24HourTime = false } = config;

  //const [amendmentReason, setAmendmentReason] = useState("");
  const [acknowledgementNotes, setAcknowledgementNotes] = useState("");
  const [acknowledgementDate, setAcknowledgementDate] = useState(new Date());
  const [acknowledgementTime, setAcknowledgementTime] = useState(
    moment().format(enable24HourTime ? timeFormatFor24Hr : timeFormatFor12Hr)
  );
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);

  // Function to get medication details from hostData
  const getMedicationDetails = () => {
    const { slot, drugName, scheduledTime, performerName } = hostData || {};
    
    if (!slot || !drugName) {
      return "No medication information available";
    }

    const medicationInfo = [];
    
    // Drug name
    if (drugName) {
      medicationInfo.push(`Medication: ${drugName}`);
    }
    
    // Scheduled time
    if (scheduledTime) {
      medicationInfo.push(`Scheduled Time: ${scheduledTime}`);
    }
    
    // Performer/Administrator
    if (performerName) {
      medicationInfo.push(`Administered by: ${performerName}`);
    }
    
    // Dose information if available
    if (slot.order?.dose && slot.order?.doseUnits) {
      medicationInfo.push(`Dose: ${slot.order.dose} ${slot.order.doseUnits.display}`);
    }
    
    // Route if available
    if (slot.order?.route?.display) {
      medicationInfo.push(`Route: ${slot.order.route.display}`);
    }
    
    // Administration time if available
    if (slot.medicationAdministration?.administeredDateTime) {
      const adminTime = moment(slot.medicationAdministration.administeredDateTime).format('DD MMM YYYY, HH:mm');
      medicationInfo.push(`Actual Administration Time: ${adminTime}`);
    }

    return medicationInfo.join('\n');
  };

  const updateSliderContentModified = (value) => {
    setSliderContentModified((prev) => {
      return {
        ...prev,
        drugChartNoteAcknowledgement: value,
      };  
    });
  };

  // const handleReasonChange = (e) => {
  //   updateSliderContentModified(true);
  //   setAmendmentReason(e.target.value);
  // };

  const handleNotesChange = (e) => {
    updateSliderContentModified(true);
    setAcknowledgementNotes(e.target.value);
  };

  const handleDateChange = (date) => {
    updateSliderContentModified(true);
    setAcknowledgementDate(date);
  };

  const handleTimeChange = (time) => {
    updateSliderContentModified(true);
    setAcknowledgementTime(time);
  };

  const isFormValid = () => {
    return acknowledgementNotes.trim() !== "";
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      return;
    }

    setIsSaveDisabled(true);

    const acknowledgementData = {
      noteUuid: hostData?.medicationAdministrationNoteUUID,
      acknowledgementNotes: acknowledgementNotes,
      amendedByUuid: hostData?.slot?.medicationAdministration?.providers?.[0]?.uuid,
    };

    try {
      await saveMedicationAmendmentNote(acknowledgementData);

      handleAuditEvent("ACKNOWLEDGE_MEDICATION_TASK");

      setIsSaveDisabled(false);
      hostApi.onModalSave?.();
    } catch (error) {
      console.error("Error saving amendment:", error);
      setIsSaveDisabled(false);
    }
  };

  const handleCancel = () => {
    hostApi.onModalCancel?.();
  };

  const handleClose = () => {
    hostApi.onModalClose?.();
  };

  const sliderTitle = (
    <FormattedMessage
      id="AMENDMENT_NOTES_HEADER"
      defaultMessage="Amendment Note(s)"
    />
  );

  return (
    <I18nProvider>
      <SideBarPanel title={sliderTitle} closeSideBar={handleClose}>
        <div style={{ padding: "20px", paddingBottom: "120px" }}>
              <Toggle
                    data-testId="acknowledge-toggle"
                    //id={medicationTask.uuid}
                    size={"sm"}
                    labelA="Acknowledged"
                    labelB="Acknowledged"
                    // labelA={getLabel(tasks[medicationTask.uuid]?.actualTime)}
                    // labelB={getLabel(tasks[medicationTask.uuid]?.actualTime)}
                    //onToggle={handleToggle}
                    // disabled={
                    //   !tasks[medicationTask.uuid]?.isRelevantTask ||
                    //   (!medicationTask.isANonMedicationTask &&
                    //     medicationTask.serviceType !== "AsNeededPlaceholder" &&
                    //     disableDoneTogglePostNextTaskTime(
                    //       medicationTask,
                    //       groupSlotsByOrderId
                    //     ))
                    // }
                  />
                  <span style={{ color: "red" }}> *</span>

          {/* Amendment Date and Time */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <DatePickerCarbon
              id="acknowledgement-date"
              data-testid="acknowledgement-date"
              onChange={(e) => {
                handleDateChange(new Date(e[0]));
              }}
              title="Date"
              value={acknowledgementDate}
              dateFormat="d M Y"
              placeholder="DD MMM YYYY"
            />
            {enable24HourTime ? (
              <TimePicker24Hour
                id="acknowledgement-time"
                data-testid="acknowledgement-time"
                defaultTime={acknowledgementTime}
                onChange={handleTimeChange}
                labelText={`Time (${timeText24})`}
                width="250px"
              />
            ) : (
              <TimePicker
                id="acknowledgement-time"
                data-testid="acknowledgement-time"
                defaultTime={acknowledgementTime}
                onChange={handleTimeChange}
                labelText={`Time (${timeText12})`}
                width="155px"
              />
            )}
          </div>

          {/* Acknowledgement Notes */}
          <div style={{ marginBottom: "16px" }}>
            <TextArea
              id="acknowledgement-notes"
              data-testid="acknowledgement-notes"
              type="text"
              rows={4}
              value={acknowledgementNotes}
              onChange={handleNotesChange}
              labelText={
                <span>
                  <FormattedMessage
                    id="ACKNOWLEDGEMENT_NOTES"
                    defaultMessage="Acknowledgement Notes"
                  />
                  <span style={{ color: "red" }}> *</span>
                </span>
              }
              placeholder="Enter acknowledgement notes"
              invalid={!acknowledgementNotes.trim() && isSaveDisabled}
              invalidText="Acknowledgement notes are required"
            />
          </div>

                  {/* Fetch previous medication and original Notes */}
         {/* Medication Details - Disabled Text Area */}
          <div style={{ marginBottom: "16px" }}>
            <TextArea
              id="medication-details"
              data-testid="medication-details"
              type="text"
              rows={6}
              value={getMedicationDetails()}
              disabled={true}
              labelText={
                <FormattedMessage
                  id="ADMINISTERED_MEDICATION_DETAILS"
                  defaultMessage="Administered Medication Details"
                />
              }
              placeholder="Medication details will be displayed here"
            />
          </div>

          {/* Original Notes (if any) - Read only */}
          {hostData?.existingNotes && (
            <div style={{ marginBottom: "16px" }}>
              <TextArea
                id="original-notes"
                data-testid="original-notes"
                type="text"
                rows={3}
                value={hostData.existingNotes}
                disabled={true}
                labelText={
                  <FormattedMessage
                    id="ORIGINAL_ADMINISTRATION_NOTES"
                    defaultMessage="Original Administration Notes"
                  />
                }
              />
            </div>
          )}

        </div>

        <SaveAndCloseButtons
          onSave={handleSave}
          onClose={handleCancel}
          isSaveDisabled={isSaveDisabled || !isFormValid()}
        />
      </SideBarPanel>
    </I18nProvider>
  );
};

DrugChartNoteAcknowledgementSlider.propTypes = {
  hostData: PropTypes.object.isRequired,
  hostApi: PropTypes.object.isRequired,
};

export default DrugChartNoteAcknowledgementSlider;
