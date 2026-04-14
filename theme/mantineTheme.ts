import {
    InputBase,
    MantineTheme,
    MultiSelect,
    NumberInput,
    PasswordInput,
    rem,
    TextInput,
    Textarea,
    Select, PillsInput, Modal, Autocomplete, TagsInput, Combobox,
} from "@mantine/core";
import dateStyles from './modules/Dates.module.css';
import cx from 'clsx';
import classes from './modules/Components.module.css';
import {DateInput, DatePickerInput, DateTimePicker, TimeInput} from "@mantine/dates";
import {shadows} from "@/theme/index";

export const mantineTheme: MantineTheme | {} = {
    // d: 'DD MM YYYY',
    // datesLocale: 'en',
    fontFamily: "'Proxima Nova', sans-serif",
    lineHeights: {
        md: 'normal'
    },
    scale: 1,
    primaryColor: 'scBlue',
    colors: ({
        scBlue: [
            '#e9f1ff',
            '#d0deff',
            '#9eb9fc',
            '#6893fb',
            '#000000',
            '#265dfa',
            '#003ED0',
            '#0038c0',
            '#0025b9',
            '#001c88'
        ],
        // scBlue: generateColors('#003ED0'),
    } as any),
    spacing: {
        xs: rem(10),
        sm: rem(12),
        md: rem(14),
        lg: rem(16),
        xl: rem(18)
    },
    fontSizes: {
        // xs: rem(10),
        sm: rem(13),
        md: rem(16),
        lg: rem(18),
        xl: rem(20),
        xxl: rem(22),
        xxxl: rem(26),
    },
    components: {
        Combobox: Combobox.extend({
            styles: {
                dropdown: {
                    maxHeight: 'min(50vh, 480px)',
                    overflowY: 'auto',
                }
            }
        }),
        Anchor: {
            defaultProps: {
                fw: 700,
            }
        },
        Text: {
            styles: (t, p) => ({
                root: {
                    fontSize: p.size === 'xs' && 10
                }
            })
        },
        Input: {
            styles: {
                input: {
                    lineHeight: 1.55
                }
            }
        },
        Tooltip: {
            defaultProps: {
                events: {
                    focus: true,
                    hover: true,
                    touch: true,
                }
            }
        },
        Button: {
            defaultProps: {
                radius: 'sm',
                // fs: 'md'
            },
            styles: (theme, params) => ({
                root: {
                    minWidth: 110,
                    /*'&[dataDisabled]': {
                        backgroundColor: isScButtonVariant(params) ? '#99B2EC !important' : undefined,
                        color: isScButtonVariant(params) ? 'white !important' : undefined,
                    }*/
                },
            }),
        },
        InputWrapper: {
            defaultProps: {
                inputWrapperOrder: ['label', 'input', 'description', 'error'],
            },
        },
        TextInput: TextInput.extend({
            classNames: (theme, props) => ({
                input: cx({ [classes.inputError]: props.error }),
                error: cx({ [classes.errorHint]: props.error }),
            }),
            styles: {
                root: {
                    maxWidth: 500
                }
            }
        }),
        InputBase: InputBase.extend(
            {
                classNames: (theme, props) => ({
                    input: cx({ [classes.inputError]: props.error }),
                    error: cx({ [classes.errorHint]: props.error }),
                }),
                styles: {
                    root: {
                        maxWidth: 500
                    }
                }
            }
        ),
        PasswordInput: PasswordInput.extend(
            {
                classNames: (theme, props) => ({
                    input: cx({ [classes.inputError]: props.error }),
                    error: cx({ [classes.errorHint]: props.error }),
                }),
                styles: {
                    root: {
                        maxWidth: 500
                    }
                }
            }
        ),
        NumberInput: NumberInput.extend(
            {
                classNames: (theme, props) => ({
                    input: cx({ [classes.inputError]: props.error }),
                    error: cx({ [classes.errorHint]: props.error }),
                }),
                styles: {
                    root: {
                        maxWidth: 500
                    }
                }
            }
        ),
        Textarea: Textarea.extend(
            {
                classNames: (theme, props) => ({
                    input: cx({ [classes.inputError]: props.error }),
                    error: cx({ [classes.errorHint]: props.error }),
                }),
                styles: {
                    root: {
                        maxWidth: 500
                    }
                }
            }
        ),
        DatePickerInput: DatePickerInput.extend(
            {
                classNames: (t, props) => ({
                    day: dateStyles.day,
                    input: cx({ [classes.inputError]: props.error }),
                    error: cx({ [classes.errorHint]: props.error }),
                })
            }
        ),
        DateInput: DateInput.extend(
            {
                classNames: (t, props) => ({
                    day: dateStyles.day,
                    input: cx({ [classes.inputError]: props.error }),
                    error: cx({ [classes.errorHint]: props.error }),
                }),
                styles: {
                    root: {
                        maxWidth: 500
                    }
                }
            }
        ),
        DateTimePicker: DateTimePicker.extend(
            {
                classNames: (t, props) => ({
                    day: dateStyles.day,
                    input: cx({ [classes.inputError]: props.error }),
                    error: cx({ [classes.errorHint]: props.error }),
                }),
                styles: {
                    root: {
                        maxWidth: 500
                    }
                }
            }
        ),
        TimeInput: TimeInput.extend(
            {
                classNames: (theme, props) => ({
                    input: cx({ [classes.inputError]: props.error }),
                    error: cx({ [classes.errorHint]: props.error }),
                }),
                styles: {
                    root: {
                        maxWidth: 500
                    }
                }
            }
        ),
        Select: Select.extend(
            {
                classNames: (theme, props) => ({
                    input: cx({ [classes.inputError]: props.error }),
                    error: cx({ [classes.errorHint]: props.error }),
                }),
                styles: {
                    root: {
                        maxWidth: 500
                    },
                    dropdown: {
                        maxHeight: 'min(50vh, 480px)',
                        overflowY: 'auto',
                    }
                }
            }
        ),
        Autocomplete: Autocomplete.extend(
            {
                classNames: (theme, props) => ({
                    input: cx({ [classes.inputError]: props.error }),
                    error: cx({ [classes.errorHint]: props.error }),
                }),
                styles: {
                    root: {
                        maxWidth: 500
                    },
                    dropdown: {
                        maxHeight: 'min(50vh, 480px)',
                        overflowY: 'auto',
                    }
                }
            }
        ),
        MultiSelect: MultiSelect.extend(
            {
                classNames: (theme, props) => ({
                    input: cx({ [classes.inputError]: props.error }),
                    error: cx({ [classes.errorHint]: props.error }),
                }),
                styles: {
                    root: {
                        maxWidth: 500
                    },
                    dropdown: {
                        maxHeight: 'min(50vh, 480px)',
                        overflowY: 'auto',
                    }
                }
            }
        ),
        TagsInput: TagsInput.extend(
            {
                classNames: (theme, props) => ({
                    input: cx({ [classes.inputError]: props.error }),
                    error: cx({ [classes.errorHint]: props.error }),
                }),
                styles: {
                    root: {
                        maxWidth: 500
                    },
                    dropdown: {
                        maxHeight: 'min(50vh, 480px)',
                        overflowY: 'auto',
                    }
                }
            }
        ),
        PillsInput: PillsInput.extend(
            {
                classNames: (theme, props) => ({
                    input: cx({ [classes.inputError]: props.error }),
                    error: cx({ [classes.errorHint]: props.error }),
                }),
                styles: {
                    root: {
                        maxWidth: 500
                    }
                }
            }
        ),
        Modal: Modal.extend(
            {
                styles: {
                    overlay: {
                        color: '#003ED0',
                        blur: 10,
                        opacity: .55
                    }
                },
                defaultProps: {
                    size: 'auto',
                    withCloseButton: false,
                    closeOnEscape: true,
                    closeOnClickOutside: true,
                    centered: true,
                    radius: 6,
                    overlayProps: {
                        color: 'var(--mantine-color-scBlue-5)',
                        blur: 10,
                        opacity: .55
                    },
                    transitionProps: {
                        transition: "pop",
                        exitDuration: 50,
                        duration: 100,
                        timingFunction: "ease"
                    },
                }
            }
        ),
    },
};


// const isScControlVariant = (params) => params.variant === 'filled' && params.color === 'scBlue';
/*const isScButtonVariant = (params) => {
    // console.log(params)
    return /!*params.variant === 'filled' &&*!/ params.color === 'scBlue'
};*/
