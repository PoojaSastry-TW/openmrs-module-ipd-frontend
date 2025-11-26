import React,{useContext} from "react";
import PropTypes from "prop-types";
import { TooltipDefinition } from "carbon-components-react";
import "../styles/TimeCell.scss";
import SVGIcon from "./SVGIcon.jsx";
import NoteIcon from "../../../../icons/note.svg";
import { ifMedicationNotesPresent } from "../utils/DrugChartUtils";
import { timeFormatFor24Hr } from "../../../../constants.js";
import moment from "moment";
//import { DrugChartSlotContext } from "../../../../context/DrugChartSlotContext.jsx";

export default function TimeCell(props) {
    const {
    slotInfo = [],
    startTime = "",
    endTime = "",
    doHighlightCell,
    highlightedCell,
    isBlank,
    isWholeHourStartTime,
    onIconClick,
    rowData,
  } = props;
  //const { onSlotClick, onSlotClickForAcknowledgement, drugAmendmentNote } = useContext(DrugChartSlotContext);

  const left = [],
    right = [];
  slotInfo.map((slot) => {
    const { time } = slot;
    const momentTime = moment(time, timeFormatFor24Hr);
    let diffStartTime = momentTime.diff(startTime);
    let diffEndTime = endTime.diff(momentTime);

    if (endTime.isBefore(startTime)) {
      const midnight = moment("00:00", timeFormatFor24Hr);
      if (momentTime.isAfter(midnight)) {
        diffStartTime = midnight.diff(startTime) + momentTime.diff(midnight);
      } else {
        diffEndTime = momentTime.diff(midnight) + midnight.diff(endTime);
      }
    }
    if (diffStartTime < diffEndTime) {
      left.push(slot);
    } else {
      right.push(slot);
    }
  });

  const renderNoteIcon = () => (
    <div className="note-icon-container">
      <NoteIcon />
    </div>
  );

  return (
    <div
      className={
        isWholeHourStartTime
          ? "time-cell-for-whole-hour"
          : "time-cell-for-half-hour"
      }
    >
      <div
        data-testid="left-icon"
        className={
          doHighlightCell && highlightedCell === "left" ? "highlightedCell" : ""
        }
      >
        {left.map((slot) => {
          const { status, administrationInfo, notes, minutes } = slot;
          const handleClick = () => onIconClick && onIconClick(slot);
          /*//Trial code for amendment vs acknowledgement click handling
            const handleClick = (slot) => {
    // First, handle the existing onIconClick functionality
    if (onIconClick) {
      onIconClick(slot);
    }

    // Then, handle the context-based slot click logic
    if (drugAmendmentNote === false) {
      onSlotClickForAcknowledgement?.(slot, rowData);
    } else {
      onSlotClick?.(slot, rowData);
    }
  }; */
          return (
            <div
              key={minutes}
              onClick={() => handleClick(slot)}
              style={onIconClick ? { cursor: "pointer" } : {}}
            >
              <SVGIcon
                iconType={status}
                info={administrationInfo}
              />
              {ifMedicationNotesPresent(notes, status) && (
                <span data-testid="left-notes">
                  <TooltipDefinition tooltipText={notes}>
                    {renderNoteIcon()}
                  </TooltipDefinition>
                </span>
              )}
            </div>
          );
        })}
      </div>
      {!isBlank ? (
        <div
          data-testid="right-icon"
          className={
            doHighlightCell && highlightedCell === "right"
              ? "highlightedCell"
              : ""
          }
        >
          {right.map((slot) => {
            const { status, administrationInfo, notes, minutes } = slot;
            const handleClick = () => onIconClick && onIconClick(slot);
             /*//Trial code for amendment vs acknowledgement click handling
            const handleClick = (slot) => {
    // First, handle the existing onIconClick functionality
    if (onIconClick) {
      onIconClick(slot);
    }

    // Then, handle the context-based slot click logic
    if (drugAmendmentNote === false) {
      onSlotClickForAcknowledgement?.(slot, rowData);
    } else {
      onSlotClick?.(slot, rowData);
    }
  }; */
            return (
              <div
                key={minutes}
                onClick={handleClick}
                style={onIconClick ? { cursor: "pointer" } : {}}
              >
                <SVGIcon
                  iconType={status}
                  info={administrationInfo}
                />
                {ifMedicationNotesPresent(notes, status) && (
                  <span data-testid="right-notes">
                    <TooltipDefinition tooltipText={notes}>
                      {renderNoteIcon()}
                    </TooltipDefinition>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="blank"></div>
      )}
    </div>
  );
}

TimeCell.propTypes = {
  slotInfo: PropTypes.array,
  doHighlightCell: PropTypes.bool,
  highlightedCell: PropTypes.string,
  startTime: PropTypes.object,
  endTime: PropTypes.object,
  isBlank: PropTypes.bool,
  isWholeHourStartTime: PropTypes.bool,
  onIconClick: PropTypes.func,
  rowData: PropTypes.object, // Added prop type for rowData
};
