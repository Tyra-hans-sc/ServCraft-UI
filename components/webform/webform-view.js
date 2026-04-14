import { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Typeahead, AsyncTypeahead } from 'react-bootstrap-typeahead';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import DOMPurify from 'isomorphic-dompurify';

const WebFormView = ({ o, k, authenticated, form, api, css }) => {

    const https = require("https");

    const parseMetaData = () => {
        let meta = !authenticated ? {
            inputs: [],
            colCount: 1
        } : JSON.parse(form.MetaData);
        if (!meta.inputs) {
            meta = {
                inputs: meta,
                colCount: 1
            };
        }
        return meta;
    };

    // only one ref is allowed
    const selectRef = useRef();
    const [searchText, setSearchText] = useState("");

    const [formData] = useState(parseMetaData().inputs);
    const [colCount] = useState(parseMetaData().colCount);
    const [errors, setErrors] = useState({});
    const [inputs, setInputs] = useState({});
    const [originCheck, setOriginCheck] = useState(null);
    const [recaptchaStatus, setRecaptchaStatus] = useState(null);
    const [validationMessage, setValidationMessage] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState({});

    const [success, setSuccess] = useState(false);



    const getOptions = (name) => {
        if (options[name]) {
            return options[name];
        } else {
            return [];
        }
    }

    const updateOptions = (name, opts) => {
        setOptions({ ...options, [name]: opts });
    }

    const handleMessage = (event) => {
        if (event.data === "getOrigin") {
            let origin = event.origin
            // for debugging
            if (origin === "null") {
                origin = "http://localhost:3000";
            }
            setOriginCheck(origin);
        }
    };

    const updateIFrameSize = () => {
        let form = document.getElementById("servCraft_FormContainer");
        let width = form.clientWidth;
        if (width < 340) {
            width = 340;
        }

        window.parent.postMessage(`setHeight_${form.clientHeight + 10 + 78}px`, "*");
        window.parent.postMessage(`setWidth_${width + 10}px`, "*");
    };

    useEffect(() => {
        let inps = {};
        formData.map(datum => {
            inps[datum.name] = null;
            if (datum.type === "select" && authenticated) {
                handleSearch("", datum);
            }
        });
        setInputs(inps);

        window.addEventListener("message", handleMessage);
        window.addEventListener("resize", updateIFrameSize);

        window.parent.postMessage("getOrigin", "*");

        updateIFrameSize();

        return () => {
            window.removeEventListener("message", handleMessage);
            window.removeEventListener("resize", updateIFrameSize);
        };
    }, []);

    const updateInput = (e) => {
        console.log(e.target.name, e.target.value);
        setInputs({ ...inputs, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: null });
    };

    const updateDate = (e) => {
        console.log(e);
    };

    const validate = () => {
        let valid = true;

        let errs = {};
        formData.map(datum => {
            if (datum.required) {
                let val = inputs[datum.name];
                // console.log({ name: datum.name, val });
                if (val === undefined || val === null || val.toString().trim() === "" || val === '[]') {
                    valid = false;
                    errs[datum.name] = datum.validationMessage;
                } else {
                    let valInp = [];
                    if (datum.type === "email") {
                        valInp.push({ key: datum.name, value: inputs[datum.name], type: Enums.ControlType.Email });
                    } else if (datum.type === "tel") {
                        valInp.push({ key: datum.name, value: inputs[datum.name], type: Enums.ControlType.ContactNumber });
                    }
                    const [itemValid, itemErrors] = Helper.validateInputsArrayOut(valInp);
                    valid = itemValid && valid;
                    if (!itemValid) {
                        errs[datum.name] = itemErrors[datum.name];
                    }
                }
            }
        });

        setErrors(errs);

        if (!recaptchaStatus) {
            setValidationMessage("reCaptcha needs to be checked");
            valid = false;
        }

        setTimeout(() => {
            updateIFrameSize();
        }, 100);

        return valid;
    };

    const submitForm = async () => {

        console.log(o, k, originCheck);

        if (!o || !k) {
            setValidationMessage("Unknown form");
            return;
        }

        if (originCheck !== o) {
            setValidationMessage("Origin mismatch");
            return;
        }

        if (!validate()) {
            return;
        }

        const https = require("https");

        const getAgent = () => {
            let agent = new https.Agent({
                rejectUnauthorized: false
            });
            return agent;
        };

        let payload = { ...inputs };
        payload.origin = o;
        payload.key = k;

        const response = await fetch(`${api}/api/WebHook/WebForm`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            agent: getAgent(),
            body: JSON.stringify(payload)
        });

        const data = await response.text();
        const json = data.length ? JSON.parse(data) : null;

        if (json.success) {
            setSuccess(true);
        } else {
            setValidationMessage(json.message);
        }
    };

    const fileChanged = (e, datum) => {
        let input = e.target;
        let file = input.files.length > 0 ? e.target.files[0] : null;
        if (file) {
            console.log(file);
            let reader = new FileReader();
            reader.onload = () => {
                var b64 = reader.result.replace(/^data:.+;base64,/, '');
                // file size limit in mb (4mb)
                if (b64.length > 4 * 1024 * 1024) {
                    input.value = null;
                    setErrors({ ...errors, [datum.name]: "File size is too large" })
                } else {
                    setInputs({ ...inputs, [datum.name]: JSON.stringify({ fileName: file.name, contentType: file.type, content: b64 }) });
                    setErrors({ ...errors, [datum.name]: null })
                }
            };
            reader.readAsDataURL(file);
        } else {
            setInputs({ ...inputs, [datum.name]: null });
        }
    };


    const handleSearch = (query, datum) => {
        setIsLoading(true);
        const datumName = datum.name;
        setSearchText(query);
        // work on this...
        fetch(`${api}/api/WebHook/WebFormSelectSearch?origin=${encodeURIComponent(o)}&key=${encodeURIComponent(k)}&model=${encodeURIComponent(datum.model)}&filter=${encodeURIComponent(query)}`, {
            method: "GET",
            agent: new https.Agent({
                rejectUnauthorized: false
            })
        }).then((resp) => resp.json())
            .then(({ results }) => {
                updateOptions(datumName, results);
                setIsLoading(false);
            });
    };



    const handleTypeaheadChange = (selectedItem, datum) => {
        console.log(selectedItem);
        setInputs({ ...inputs, [datum.name]: JSON.stringify(selectedItem) });
        setErrors({ ...errors, [datum.name]: null })
    };

    const typeaheadOnBlur = (e, datum) => {
        if (inputs[datum.name] === '[]') {
            selectRef.current.clear();
            setSearchText("");
            handleSearch("", datum);
        }
    };

    const paginateTypeahead = (e, datum) => {
        console.log(e);
    };


    const getStyleColour = (key) => {
        return JSON.parse(form.Style)[key];
    }

    const renderDatum = (datum, key) => {
        let isInput = ["text", "number", "email", "tel"].includes(datum.type);
        let isTextArea = ["textarea"].includes(datum.type);
        let isDate = ["date"].includes(datum.type);
        let isTime = ["time"].includes(datum.type);
        let isSelect = ["select"].includes(datum.type);
        let isFile = ["file"].includes(datum.type);


        return (
            <div key={key}><Form.Group controlId={datum.name} className="webform-field">
                <Form.Label>{datum.label}</Form.Label>
                {isInput ? <>
                    <Form.Control id={datum.name} type={datum.type} name={datum.name} onKeyUp={updateInput} maxLength={datum.maxLength} />
                </> : ""}
                {isTextArea ? <>
                    <Form.Control as={datum.type} id={datum.name} name={datum.name} onKeyUp={updateInput} maxLength={datum.maxLength} />
                </> : ""}
                {isDate ? <>
                    <Form.Control id={datum.name} type={datum.type} name={datum.name} onChange={updateInput} onKeyUp={updateInput} />
                </> : ""}
                {isTime ? <>
                    <Form.Control id={datum.name} type={datum.type} name={datum.name} onChange={updateInput} onKeyUp={updateInput} />
                </> : ""}
                {isSelect ? <>
                    <AsyncTypeahead
                        // searchText={searchText}
                        ref={selectRef}
                        filterBy={() => true}
                        id={datum.name}
                        isLoading={isLoading}
                        labelKey={`Description`}
                        minLength={0}
                        onSearch={(query) => handleSearch(query, datum)}
                        options={getOptions(datum.name)}
                        placeholder={""}
                        onChange={(selectedItem) => handleTypeaheadChange(selectedItem, datum)}
                        paginate={true}
                        onPaginate={(e) => paginateTypeahead(e, datum)}
                        paginationText={"Click here for more results"}
                        maxResults={100}
                        onBlur={(e) => typeaheadOnBlur(e, datum)}
                        renderMenuItemChildren={(option, props) => (
                            <>
                                <span>{option.Description}</span>
                            </>
                        )}
                    />
                </> : ""}
                {isFile ? <>
                     {/* <Form.File id={datum.name} onChange={(e) => fileChanged(e, datum)} /> */}
                     <input type="file" id={datum.name} onChange={(e) => fileChanged(e, datum)} style={{display: "block", marginBottom: "8px"}} />
                </> : ""}
                {errors[datum.name] ?
                    <p className="error">{errors[datum.name]}</p>
                    : ""}
            </Form.Group>
                <style jsx>{`
                .error {
                    color: red;
                    font-size: 0.7rem;
                    position: absolute;
                    background: rgba(255,255,255,1);
                    padding: 2px;
                    border-radius: 3px;
                }
        `}</style>
            </div>);
    }

    if (!authenticated) {
        return (<>You do not have access to this form!</>);
    }

    return (<>
        <div id="servCraft_FormContainer" style={{ height: "max-content", width: "max-content" }}>
            {form.Title ? <p className="form-title">{form.Title}</p> : ""}

            {success ? <div>

                <h6>Form submission successful!</h6>

            </div> : <>

                {colCount === 1 ? <>
                    {formData.map((datum, key) => {
                        return renderDatum(datum, key);
                    })}
                </> : <>
                    {
                        (() => {
                            let groups = [];
                            let temp = [...formData];
                            while (temp.length > 0) {
                                let items = temp.splice(0, temp.length > 1 ? 2 : 1);
                                groups.push(items);
                            }

                            return (<table>
                                {groups.map((group, key1) => {
                                    return <tr key={key1}>{group.map((datum, key2) => {
                                        return <td key={`${key1}_${key2}`} className="form-column">
                                            {renderDatum(datum, parseInt(key1) + parseInt(key2))}
                                        </td>
                                    })}</tr>;

                                })}
                            </table>);

                        })()
                    }

                </>}

                <div>
                    <ReCAPTCHA sitekey="6LcfxJMaAAAAAHqTcJpI5AmTE85E1kLAE5yZU29l" onChange={(value) => { setRecaptchaStatus(value); setValidationMessage(null); }} size="normal" />
                    <div className="button">
                        <Button variant="light" onClick={submitForm}>Submit</Button>
                    </div>

                    {validationMessage ? <p className="error">{validationMessage}</p> : ""}
                </div>
            </>}
        </div>

        {/* perform styles here, use a theme to decide colours maybe */}
        <style jsx>{`

            :global(body) {
                background: ${getStyleColour("background")};
                color: ${getStyleColour("color")};
            }

            .button {
                margin-top: 8px;
                border: 1px solid #ced4da;
                border-radius: 0.25rem;
                width: fit-content;
                box-shadow: 0 0 5px rgba(0,0,0,0.1);
            }

            .error {
                color: red;
                background: rgba(255,255,255,1);
                padding: 2px;
                border-radius: 3px;
                font-size: 0.7rem;
                position: absolute;
            }

            #servCraft_FormContainer {
                padding: 16px;
            }

            .form-title {
                font-weight: bold;
                font-size: 1.2rem;
                margin: 0 0 8px 0;
            }

            .form-column {
                width: 304px;
            }

            .form-column + .form-column {
                padding-left: 1rem;
            }

            :global(.webform-field) {
                display: flex !important;
                align-items: center !important;
                margin-bottom: 1rem !important;
            }

            :global(.webform-field .form-label) {
                margin-bottom: 0 !important;
                margin-right: 1rem !important;
                white-space: nowrap !important;
                width: 150px !important;
                flex-shrink: 0 !important;
            }

            :global(.webform-field .form-control) {
                flex: 1 !important;
            }

        `}</style>

        {/* protect against cross site scripting before using the provided css */}
        {css ? <style dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(css) }}></style> : ""}
    </>);
};

export default WebFormView;
