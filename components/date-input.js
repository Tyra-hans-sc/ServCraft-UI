import React from 'react'

function DateInput(props) {

    return <>Deprecated Component</>
/*
  function CustomOverlay({ classNames, selectedDay, children, ...props }) {
    return (
      <div className={classNames.overlayWrapper} style={{ marginLeft: -32, zIndex: 3 }} {...props}>
        <div className={classNames.overlay}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <label>{props.label}</label>
        {props.error && props.error != ""
          ? <div className="label error">{props.error}</div>
          : props.required
            ? <div className="label">Required</div>
            : ""
        }
      </div>
      
      <DayPickerInput
        inputProps={{disabled: props.disabled}}
        format="yyyy-MM-DD"
        formatDate={formatDate}
        parseDate={parseDate}
        placeholder={`YYYY-MM-DD`}
        onDayChange={props.changeHandler}
        value={props.date ? Time.parseDate(props.date) : undefined}
        overlayComponent={CustomOverlay}
      />

      <style jsx>{`
        .dateinput-overlay {
          z-index: 2;
          background-color: ${colors.white};
        }

        .container {
          background-color: ${colors.formGrey};
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          height: fit-content;
          padding: 0.5rem;
          width: 100%;
          margin-top: 1rem;
          min-height: 3.6rem;
        }

        .container :global(input) {
          background: none;
          border: none;
          box-shadow: none;
          color: ${colors.darkPrimary}; 
          font-family: ${fontFamily};
          font-size: ${fontSizes.body};
          height: 100%;
          outline: none;
          width: 100%;
        }

        label, .label {
          color: ${colors.labelGrey}; 
          font-size: ${fontSizes.label};
          text-align: left;
        }

        ::-webkit-input-placeholder { 
          color: ${colors.blueGrey};
        }

        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px ${colors.formGrey} inset !important;
        }

        .error {
          color: ${colors.warningRed};
          text-align: right;
        }

        .row {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );*/
}

export default DateInput
