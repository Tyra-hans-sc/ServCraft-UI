import React from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../theme';
import {Tooltip, Button as MantineButton, Box} from "@mantine/core";

const useMantineButton = false;

function Button(props) {

  const buttonIcon = () => {
    if (props.icon) {
      return (
        <>
          <img className="icon" src={"/icons/" + props.icon + ".svg"} height="24" />
          <div className="icon-spacer"></div>
        </>
      )
    } else {
      return ""
    }
  }

 /* if(useMantineButton) {
    return (
        <div
            className={'button ' + props.extraClasses}
        >
            <Tooltip
                label={props.tooltip || ''}
                disabled={!props.tooltip}
            >
                <MantineButton
                    // mt={'sm'}
                    style={{alignSelf: 'center'}}
                    // className={'button'}
                    w={'100%'}
                    onClick={props.onClick}
                    disabled={props.disabled}
                    leftSection={buttonIcon()}
                    variant={props.extraClasses.includes('white-action') || props.extraClasses.includes('hollow') ? 'outline' : props.extraClasses.includes('grey-action') ? 'subtle' : 'filled'}
                    color={props.extraClasses.includes('grey-action') ? 'gray.7' : props.extraClasses.includes('white-action') ? 'gray.7' : ''}
                >
                    {
                        props.text
                    }
                </MantineButton>
            </Tooltip>


            <style jsx>{`
                .button {
                    align-items: center;
                    //background-color: ${colors.bluePrimary};
                    //border-radius: ${layout.buttonRadius};
                    box-sizing: border-box;
                    //color: ${colors.white};
                    //cursor: pointer;
                    display: flex;
                    height: 2.5rem;
                    font-weight: bold;
                    justify-content: center;
                    margin-top: 1.5rem;
                    //padding: 0 1rem;
                    position: relative;
                    width: 100%;
                }

                .w7 {
                    width: 7rem;
                }

                .button.disabled {
                    background-color: ${colors.blueGreyLight};
                    cursor: default;
                }

                .w9 {
                    width: 9rem;
                }

                .w10 {
                    width: 10rem;
                }

                .w11 {
                    width: 11rem;
                }

                .w12 {
                    width: 12rem;
                }

                .w13 {
                    width: 13rem;
                }

                .auto {
                    width: auto;
                }

                .text {
                    margin: 0;
                    text-decoration: none;
                    white-space: nowrap;
                }

                .button :global(.icon) {
                    left: 0.75rem;
                    position: absolute;
                    top: calc(50% - 0.75rem);
                }

                .button :global(.icon-spacer) {
                    height: 1.5rem;
                    width: 2rem;
                }

                .is-loading .text {
                    display: none;
                }

                .is-loading :global(.icon) {
                    display: none;
                }

                .is-loading .loader {
                    display: block;
                }

                .hollow {
                    background: none;
                    //border: 1px solid ${colors.bluePrimary};
                    color: ${colors.bluePrimary};
                }

                .hollow-warning {
                    background: none;
                    //border: 1px solid ${colors.warningRed};
                    color: ${colors.warningRed};
                }

                .error {
                    // border: 1px solid ${colors.mantineErrorOrange()} !important;
                }

                .green {
                    background: ${colors.green};
                }

                .orange {
                    background: ${colors.orangeWidget};
                }

                .red-light {
                    background: ${colors.warningRedLight};
                }

                .blue-borderless {
                    color: ${colors.bluePrimary};
                    border: none;
                    background: none;
                }

                .grey-action-link {
                    color: ${colors.labelGrey};
                    border: none;
                    background: none;
                    text-decoration: underline;
                    font-weight: normal;
                    font-size: 0.8rem;
                }

                .white-action {
                    background-color: ${colors.white};
                    // border: 1px solid ${colors.blueGreyLight};
                    color: ${colors.darkPrimary};
                    font-weight: normal;
                }

                .white-action :global(.icon) {
                    margin: 0 0.5rem 0 -0.5rem;
                }

                .green-action {
                    background-color: ${colors.white};
                    //border: 1px solid ${colors.green};
                    color: ${colors.green};
                    font-weight: normal;
                }

                .green-action :global(.icon) {
                    margin: 0 0.5rem 0 -0.5rem;
                }

                .warning-action {
                    background-color: ${colors.alertOrange};
                    // border: 1px solid ${colors.alertOrange};
                    color: ${colors.white};
                    font-weight: normal;
                }

                .error-action {
                    background-color: ${colors.warningRed};
                    // border: 1px solid ${colors.warningRed};
                    color: ${colors.white};
                    font-weight: normal;
                }

                .grey-action {
                    background-color: ${colors.blueGreyLight};
                    //border: 1px solid ${colors.blueGreyLight};
                    color: ${colors.white};
                    font-weight: normal;
                }

                .grey-action :global(.icon) {
                    margin: 0 0.5rem 0 -0.5rem;
                }

                .dark-blue-action {
                    background-color: ${colors.bluePrimaryDark};
                    //border: 1px solid ${colors.white};
                    color: ${colors.white};
                    font-weight: normal;
                }

                .white {
                    background-color: ${colors.white};
                    color: ${colors.blueDark};
                }

                .white-overlay {
                    background-color: ${colors.white};
                    // border-radius: ${layout.bodyRadius};
                    color: ${colors.darkPrimary};
                    font-size: 0.75rem;
                    font-weight: normal;
                    height: 2rem;
                    margin: 0 1rem 0 0;
                    width: auto;
                }

                .grey-overlay {
                    //border: 1px solid ${colors.blueGreyLight};
                    color: ${colors.darkPrimary};
                    background-color: ${colors.white};
                    // border-radius: ${layout.bodyRadius};
                    font-size: 0.75rem;
                    font-weight: normal;
                    height: 2rem;
                    margin: 0 1rem 0 0;
                    width: auto;
                }

                .fit-content {
                    width: auto;
                    width: fit-content;
                }

                .no-margin {
                    margin-top: 0px;
                }

                .small-margin {
                    margin-top: 0.5rem;
                }

                .left-margin {
                    margin-left: 0.5rem;
                }

                .right-margin {
                    margin-right: 0.5rem;
                }

                .select-all {
                    //padding-left: 2rem;
                    position: relative;
                }

                .select-all:before {
                    // border: 1px solid ${colors.labelGrey};
                    // border-radius: ${layout.inputRadius};
                    box-sizing: border-box;
                    content: "";
                    cursor: pointer;
                    height: 1rem;
                    left: 0.5rem;
                    opacity: 0.4;
                    position: absolute;
                    width: 1rem;
                }

                .selected-all {
                    //padding-left: 2rem;
                    position: relative;
                }

                .selected-all:before {
                    background-color: ${colors.bluePrimary};
                    background-image: ${tickSvg};
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: 70%;
                    // border-radius: ${layout.inputRadius};
                    content: "";
                    height: 1rem;
                    left: 0.5rem;
                    position: absolute;
                    width: 1rem;
                }

                .negative-left-margin {
                    margin-left: -68px;
                }

                .float-right {
                    float: right;
                }

                .margin-auto {
                    margin: auto;
                }

            `}</style>

        </div>

    )
  }*/

    return (
        <div data-cy={props.cypress} title={`${props.tooltip ? props.tooltip : ''}`}
             className={"button " + props.extraClasses + (props.disabled === true ? " disabled" : "")} onClick={(e) => {
            if (props.disabled !== true && props.onClick) {
                props.onClick(e);
            }
        }}>
            <div className="loader"></div>
            {buttonIcon()}
            <p className="text">{props.text}</p>

            <style jsx>{`
                .button {
                    align-items: center;
                    background-color: ${colors.bluePrimary};
                    border-radius: ${layout.buttonRadius};
                    box-sizing: border-box;
                    color: ${colors.white};
                    cursor: pointer;
                    display: flex;
                    height: 2.5rem;
                    font-weight: bold;
                    justify-content: center;
                    margin-top: 1.5rem;
                    padding: 0 1rem;
                    position: relative;
                    width: 100%;
                }

                .w7 {
                    width: 7rem;
                }

                .button.disabled {
                    background-color: ${colors.blueGreyLight};
                    cursor: default;
                }

                .w9 {
                    width: 9rem;
                }

                .w10 {
                    width: 10rem;
                }

                .w11 {
                    width: 11rem;
                }

                .w12 {
                    width: 12rem;
                }

                .w13 {
                    width: 13rem;
                }

                .auto {
                    width: auto;
                }

                .text {
                    margin: 0;
                    text-decoration: none;
                    white-space: nowrap;
                }

                .button :global(.icon) {
                    left: 0.75rem;
                    position: absolute;
                    top: calc(50% - 0.75rem);
                }

                .button :global(.icon-spacer) {
                    height: 1.5rem;
                    width: 2rem;
                }

                .is-loading .text {
                    display: none;
                }

                .is-loading :global(.icon) {
                    display: none;
                }

                .is-loading .loader {
                    display: block;
                }

                .hollow {
                    background: none;
                    border: 1px solid ${colors.bluePrimary};
                    color: ${colors.bluePrimary};
                }

                .hollow-warning {
                    background: none;
                    border: 1px solid ${colors.warningRed};
                    color: ${colors.warningRed};
                }

                .error {
                    border: 1px solid ${colors.mantineErrorOrange()} !important;
                }

                .green {
                    background: ${colors.green};
                }

                .orange {
                    background: ${colors.orangeWidget};
                }

                .red-light {
                    background: ${colors.warningRedLight};
                }

                .blue-borderless {
                    color: ${colors.bluePrimary};
                    border: none;
                    background: none;
                }

                .grey-action-link {
                    color: ${colors.labelGrey};
                    border: none;
                    background: none;
                    text-decoration: underline;
                    font-weight: normal;
                    font-size: 0.8rem;
                }

                .white-action {
                    background-color: ${colors.white};
                    border: 1px solid ${colors.blueGreyLight};
                    color: ${colors.darkPrimary};
                    font-weight: normal;
                }

                .white-action :global(.icon) {
                    margin: 0 0.5rem 0 -0.5rem;
                }

                .green-action {
                    background-color: ${colors.white};
                    border: 1px solid ${colors.green};
                    color: ${colors.green};
                    font-weight: normal;
                }

                .green-action :global(.icon) {
                    margin: 0 0.5rem 0 -0.5rem;
                }

                .warning-action {
                    background-color: ${colors.alertOrange};
                    border: 1px solid ${colors.alertOrange};
                    color: ${colors.white};
                    font-weight: normal;
                }

                .error-action {
                    background-color: ${colors.warningRed};
                    border: 1px solid ${colors.warningRed};
                    color: ${colors.white};
                    font-weight: normal;
                }

                .grey-action {
                    background-color: ${colors.blueGreyLight};
                    border: 1px solid ${colors.blueGreyLight};
                    color: ${colors.white};
                    font-weight: normal;
                }

                .grey-action :global(.icon) {
                    margin: 0 0.5rem 0 -0.5rem;
                }

                .dark-blue-action {
                    background-color: ${colors.bluePrimaryDark};
                    border: 1px solid ${colors.white};
                    color: ${colors.white};
                    font-weight: normal;
                }

                .white {
                    background-color: ${colors.white};
                    color: ${colors.blueDark};
                }

                .white-overlay {
                    background-color: ${colors.white};
                    border-radius: ${layout.bodyRadius};
                    color: ${colors.darkPrimary};
                    font-size: 0.75rem;
                    font-weight: normal;
                    height: 2rem;
                    margin: 0 1rem 0 0;
                    width: auto;
                }

                .grey-overlay {
                    border: 1px solid ${colors.blueGreyLight};
                    color: ${colors.darkPrimary};
                    background-color: ${colors.white};
                    border-radius: ${layout.bodyRadius};
                    font-size: 0.75rem;
                    font-weight: normal;
                    height: 2rem;
                    margin: 0 1rem 0 0;
                    width: auto;
                }

                .fit-content {
                    width: auto;
                    width: fit-content;
                }

                .no-margin {
                    margin-top: 0px;
                }

                .small-margin {
                    margin-top: 0.5rem;
                }

                .left-margin {
                    margin-left: 0.5rem;
                }

                .right-margin {
                    margin-right: 0.5rem;
                }

                .select-all {
                    padding-left: 2rem;
                    position: relative;
                }

                .select-all:before {
                    border: 1px solid ${colors.labelGrey};
                    border-radius: ${layout.inputRadius};
                    box-sizing: border-box;
                    content: "";
                    cursor: pointer;
                    height: 1rem;
                    left: 0.5rem;
                    opacity: 0.4;
                    position: absolute;
                    width: 1rem;
                }

                .selected-all {
                    padding-left: 2rem;
                    position: relative;
                }

                .selected-all:before {
                    background-color: ${colors.bluePrimary};
                    background-image: ${tickSvg};
                    background-position: center;
                    background-repeat: no-repeat;
          background-size: 70%;
          border-radius: ${layout.inputRadius};
          content: "";
          height: 1rem;
          left: 0.5rem;
          position: absolute;
          width: 1rem;
        }

        .negative-left-margin {
          margin-left: -68px;
        }

        .float-right {
          float: right;
        }

        .margin-auto {
          margin: auto;
        }

      `}</style>
    </div>
  )
}

Button.defaultProps = {
  text: 'Button',
  extraClasses: '',
};

export default Button
