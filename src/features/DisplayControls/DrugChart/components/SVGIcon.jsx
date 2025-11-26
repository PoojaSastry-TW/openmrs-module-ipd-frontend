import React from "react";
import PropTypes from "prop-types";
import { TooltipDefinition } from "carbon-components-react";
import AdministeredIcon from "../../../../icons/completed.svg";
import AdministeredLateIcon from "../../../../icons/administered-late.svg";
import LateIcon from "../../../../icons/late.svg";
import NotAdministeredIcon from "../../../../icons/missed.svg";
import PendingIcon from "../../../../icons/pending.svg";
import StoppedIcon from "../../../../icons/stopped.svg";
import "../styles/SVGIcon.scss";

export default function SVGIcon(props) {
  const { iconType, info } = props;
  let icon;
  let showTooltip = false;

  switch (iconType) {
    case "Administered":
      icon = <AdministeredIcon />;
      showTooltip = true;
      break;
    case "Not-Administered":
      icon = <NotAdministeredIcon />;
      showTooltip = true;
      break;
    case "Late":
      icon = <LateIcon />;
      break;
    case "Administered-Late":
      icon = <AdministeredLateIcon />;
      showTooltip = true;
      break;
    case "Stopped":
      icon = <StoppedIcon />;
      break;
    default:
      icon = <PendingIcon />;
  }

  return (
    <div>
      {info && showTooltip ? (
        <TooltipDefinition tooltipText={info}>
          {icon}
        </TooltipDefinition>
      ) : (
        icon
      )}
    </div>
  );
}

SVGIcon.propTypes = {
  iconType: PropTypes.string.isRequired,
  info: PropTypes.string,
};
