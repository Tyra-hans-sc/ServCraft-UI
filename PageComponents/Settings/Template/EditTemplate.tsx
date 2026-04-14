import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Button,
  TextInput,
  Highlight as MantineHighlight, Flex, Box,
  Title,
  Text, Tooltip, Menu, ActionIcon, ScrollArea
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import * as Enums from "@/utils/enums";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import {IconCodePlus, IconDeviceFloppy} from "@tabler/icons-react";
import SCTextArea from "@/components/sc-controls/form-controls/sc-textarea";
import {useFocusReturn} from "@mantine/hooks";
import {useMutation, useQuery} from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import NextLink from 'next/link'
import TemplateService from "@/services/template-service";
import Helper from "@/utils/helper";
import ConfirmAction from "@/components/modals/confirm-action";
import {useRouter} from "next/router";
import ScRichTextEditor from "@/PageComponents/Message/Communication/ScRichTextEditor";

const MAX_SMS_CHAR = 459
const MAX_CONTENT_SIZE = 1048576/2; // 500 KB in bytes

interface ReplacementTag {
  Group: string;
  Name: string;
  Description: string;
  Module: null | number;
}

const submitData = async (templateToSave: any, usePostMethod: boolean) => {
  let templateResponse: any = {};
  if (usePostMethod) {
    templateResponse = await Fetch.post({
      url: '/Template',
      params: templateToSave
    });
  } else {
    templateResponse = await Fetch.put({
      url: '/Template',
      params: templateToSave
    });
  }

  if (templateResponse.ID) {
    return templateResponse;
  } else {
    throw new Error(templateResponse.serverMessage || templateResponse.message || 'something went wrong');
  }
}

const EditTemplate = ({ stickyHeaderOffset = 0, ...props }) => {

  const form = useForm({
    initialValues: {
      ID: props.template?.ID,
      Name: props.template?.Name || '',
      IsActive: props.template?.IsActive || false,
      Subject: props.template?.Subject || '',
      SMSBody: props.template?.SMSBody || '',
      Module: +props.template.Module,
      TemplateType: +props.template.TemplateType
    },

    transformValues: (values) => ({
      ...values,
      IsActive: props.template?.Type === Enums.TemplateType.User ? values.IsActive : true,
      EmailBody: emailEditorContentHtml,
    }),

    validate: {
      Name: (value) => (value.trim().length === 0 ? 'Template name is required' : null),
      Subject: (val, values) => {
        if(val.trim().length === 0 ) {
          return 'Subject is required'
        }
        const invalidTags = TemplateService.testForValidSubject(val)
        if (invalidTags.length !== 0) {
          return 'Unfortunately ' + invalidTags.join(', ') + ' is not allowed in the message subject'
        }
        return null;
      },
      SMSBody: (val, values) => {
        if (val?.length > MAX_SMS_CHAR) {
          return `SMS content exceeds the maximum allowed characters of ${MAX_SMS_CHAR}`;
        }
        return null;
      },
    },
  });

  const router = useRouter();

  // Save mutation
  const {mutate: saveMutate, isLoading: isSaving} = useMutation((templateToSave) => submitData(templateToSave, props.fromCreate),
      {
        onSuccess: async data => {
          showNotification({
            message: 'Template saved successfully!',
            color: 'scBlue',
            autoClose: 1200
          });

          Helper.mixpanelTrack(props.fromCreate ? 'create-template' : 'edit-template', { templateID: data.ID } as any);
          form.resetDirty();
          if (props.onSave) {
            props.onSave(data.ID);
          }

          if (props.fromCreate && !props.fromExternalModule) {
            await Helper.waitABit();
            Helper.nextRouter(router.push, `/settings/template/${data.ID}`);
          } else {
            form.setValues(data); // Update form state
          }

          form.resetDirty()
        },
        onError: (error: Error) => {
          showNotification({
            message: 'An error occurred while saving the template: ' + error.message,
            color: 'yellow.7',
            autoClose: 4000
          })
        }
      });
  // Save mutation
  const {mutate: deleteMutate, isLoading: isDeleting} = useMutation((templateToSave: any) => submitData(templateToSave, false),
      {
        onSuccess: async data => {
          if (data.ID) {
            showNotification({
              title: 'Success',
              message: 'Template deleted successfully!',
              color: 'green',
            });

            form.reset(); // Clear form
            await  Helper.waitABit()
            router.replace('/settings/template/list'); // Navigate
          } else {
            showNotification({
              title: 'Error',
              message: data.serverMessage,
              color: 'yellow.7',
            });
          }
        },
        onError: (error: Error) => {
          showNotification({
            title: 'Error',
            message: 'An error occurred while deleting the template.',
            color: 'yellow.7',
          });
        }
      });

  const saveTemplate = async (values) => {
    if (form.isValid() && !contentErrorMessage) {
      saveMutate({
        ...props.template,
        ...values
      });
    }
  }

  const deleteTemplate = () => {
    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      confirmButtonText: 'Delete Template',
      heading: 'Confirm delete template?',
      text: 'This action will be permanent',
      display: true,
      onConfirm: async () => {
        deleteMutate({...props.template, IsActive: false })
      },
    });
  };
  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  !props.fromExternalModule && Helper.preventRouteChange((form.isDirty()), () => form.resetDirty(), setConfirmOptions, () => saveTemplate(form.getTransformedValues()));

  const [emailEditorContentHtml, setEmailEditorContentHtml] = useState(props.template?.EmailBody || '')

  // Function to calculate and validate content size
  const checkContentSize = (html: string) => {
    // Calculate content size in bytes

  };

  const [contentErrorMessage, setContentErrorMessage] = useState<string | null>(null);

  
  
  useEffect(() => {
    try {
      const size = new Blob([emailEditorContentHtml]).size; // Get the size of the content in bytes
      console.log("current email content size", size);

      if (size > MAX_CONTENT_SIZE) {
        const excessSize = size - MAX_CONTENT_SIZE;

        let excessSizeMessage = '';
        if (excessSize < 1024) {
          excessSizeMessage = `${excessSize} bytes`;
        } else if (excessSize < 1048576) {
          excessSizeMessage = `${(excessSize / 1024).toFixed(2)} KB`;
        } else {
          excessSizeMessage = `${(excessSize / 1048576).toFixed(2)} MB`;
        }

        setContentErrorMessage(
            `Total content exceeds the 500KB limit by ${excessSizeMessage}`
        );
      } else {
        setContentErrorMessage(null);
      }
    } catch (error) {
      console.error("Unable to determine content size", error);
    }
  }, [emailEditorContentHtml]);

 /* const emailEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      /!*TextStyle.configure({ // text style font family method not working
        HTMLAttributes: {
          class: 'my-custom-class',
        }
      }),*!/ // Needed for applying styles
      // FontFamily.configure({ defaultFont: 'Arial, sans-serif' }),
    ],
    content: props.template?.EmailBody || ''
  });*/

 /* const [emailEditorTouched, setEmailEditorTouched] = useState(false)
  const emailEditorError = useMemo(
      () => (/!*!emailEditor?.isFocused && emailEditor?.isEmpty && emailEditorTouched ? 'Email content is required' :*!/ null),
      [/!*emailEditorTouched, emailEditor?.isEmpty, emailEditor?.isFocused*!/]
  )

  useDidUpdate(() => {
    if (emailEditor?.isFocused && !emailEditorTouched) {
      setEmailEditorTouched(true)
    }
  }, [emailEditor?.isFocused])*/

  const [subjectCursorPos, setSubjectCursorPos] = useState(-1)
  const [smsCursorPos, setSmsCursorPos] = useState(-1)
  const returnFocus = useFocusReturn({ // return focus does not function with rich text component
    opened: true,
    shouldReturnFocus: subjectCursorPos !== -1 || smsCursorPos !== -1,
  });

  const [recentReplacementTagItems, setRecentReplacementTagItems] = useState([])
  const [replacementTagSearch, setReplacementTagSearch] = useState('')
  const { data: replacementTags } = useQuery(['replacementTags'], async () => {
    const { Results: tags, ...res } = await Fetch.get({
      url: `/Template/GetReplacementTagList?module=${props.template?.Module}&searchPhrase=${''}`
    })
    if (tags) {
      return tags as ReplacementTag[]
    } else {
      throw new Error(res.serverMessage || res.message || 'something went wrong')
    }
  })
  const replacementTagOptions = useCallback((onSelect: (replacementTag: ReplacementTag, event: any) => void) => {

    const filtered = replacementTags?.filter(
        x => 
        //   (
        //     x.Module === null || x.Module === +props.moduleCode
        // ) && 
        (
            !replacementTagSearch || x.Name.toLowerCase().includes(replacementTagSearch.toLowerCase()) || x.Description.toLowerCase().includes(replacementTagSearch.toLowerCase()) || x.Group.toLowerCase().includes(replacementTagSearch.toLowerCase())
        )
    )

    return <>
      <ScTextControl
          style={{ border: 0 }}
          mt={0}
          placeholder={'Search'}
          autoFocus
          value={replacementTagSearch}
          onChange={e => setReplacementTagSearch(e.currentTarget.value)}
      />
      <ScrollArea.Autosize
          mah={350}
      >
        {
            filtered?.length === 0 && replacementTagSearch &&
            <Text size={'sm'} ta={'center'} c={'dimmed'} my={'xl'}>
              Nothing found....
            </Text>
        }
        {
          filtered?.map((rt, i, a) => (
              [
                i === 0 || (a[i - 1]?.Group !== rt.Group) &&
                <Menu.Label key={rt.Name + rt.Group}>{rt.Group}</Menu.Label>,
                <Menu.Item
                    key={rt.Name}
                    onClick={
                      e => onSelect(rt, e)
                    }
                    // leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                >
                  <Flex
                      align={'center'}
                      justify={'space-between'}
                      gap={5}
                  >
                    <MantineHighlight
                        highlight={replacementTagSearch}
                        size={'sm'}
                        color={'scBlue.1'}
                    >
                      {rt.Description}
                    </MantineHighlight>
                    <MantineHighlight
                        highlight={replacementTagSearch}
                        size={'xs'}
                        fw={'bolder'}
                        color={'scBlue.1'}
                    >
                      {rt.Name}
                    </MantineHighlight>
                  </Flex>
                </Menu.Item>
              ]
          ))
        }
      </ScrollArea.Autosize>
    </>

  }, [replacementTags, replacementTagSearch])

  return (
    <Box p="md">

      {/* Form Section */}
      <form onSubmit={form.onSubmit(saveTemplate)}>
        {/* Template Name */}
        <Flex wrap={'wrap-reverse'} gap={'sm'} align={'center'} justify={'space-between'} mb={'sm'}>

          <Title order={2} c={'scBlue'}>
            Edit Template
          </Title>


          {/* Action Buttons */}
          <Flex gap={'xs'}>
            {
              !props.fromExternalModule && !props.fromCreate &&
                <Tooltip color={'scBlue'}
                         disabled={props.TemplateType === Enums.TemplateType.User}
                         label={"Cannot delete system template"}
                >
                  <Button
                      mr={'xl'}
                      variant="outline"
                      color="yellow.7"
                      loading={isDeleting}
                      onClick={deleteTemplate}
                      disabled={props.TemplateType !== Enums.TemplateType.User || !form.values.ID || isSaving}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Template'}
                  </Button>
                </Tooltip>
            }


            {
              !!props.onCancel ?
                  <Button
                      variant={'outline'}
                      disabled={isSaving}
                      onClick={props.onCancel}
                  >
                    Cancel
                  </Button>
                  :
                  <NextLink href={'/settings/template/list'}>
                    <Button
                        variant={'outline'}
                        disabled={isSaving}
                        onClick={() => Helper.nextLinkClicked('/settings/template/list')}
                    >
                      Cancel
                    </Button>
                  </NextLink>
            }

            <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                loading={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>

          </Flex>
        </Flex>

        <Flex align={'center'} gap={'sm'} mb='sm' >
          <Text c={'dimmed'} size={'md'}>
            Module: {Enums.getEnumStringValue(Enums.Module, props.template?.Module, true)}
          </Text>

          {/*<SCSwitch label="Active" checked={form.values.IsActive}
                    onToggle={(checked) => form.setFieldValue('IsActive', checked)}
          />*/}

        </Flex>

        <Flex wrap={'wrap'} justify={'stretch'} gap={'sm'}>
          <Box style={{flexGrow: 1}} maw={500}>
            <TextInput
                label="Template Name"
                placeholder="Enter template name"
                withAsterisk
                {...form.getInputProps('Name')}
                mb="md"
            />
          </Box>

          {/*<Box style={{flexGrow: 1}}>
            <SCInput
                label="Module"
                required={true}
                readOnly={true}
                value={Enums.getEnumStringValue(Enums.Module, props.template?.Module, true)}
            />
          </Box>*/}
        </Flex>


        <ScTextControl
            rightSection={
              <Tooltip
                  color={'dark'}
                  label={'Insert replacement tag'}
                  openDelay={1000}
              >
                <Menu shadow="md" width={350}
                      trapFocus={false}
                      position={'left'}

                >
                  <Menu.Target>
                    <ActionIcon
                        variant={'transparent'}
                        color={'dark'}
                        onClick={returnFocus}
                    >
                      <IconCodePlus
                          stroke={1.2}
                          size={22}
                      />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {replacementTagOptions((rt, e) => {
                      e.preventDefault();
                      form.setFieldValue('Subject', form.values.Subject.substring(0, subjectCursorPos) + '{{' + rt.Name + '}}' + form.values.Subject.substring(subjectCursorPos));
                      // setSubjectCursorPos(p => p + rt.Name.length + 4)
                      returnFocus();
                    })}
                  </Menu.Dropdown>
                </Menu>
              </Tooltip>
            }
            {...form.getInputProps('Subject')}
            onChange={event => {
              form.getInputProps('Subject').onChange(event);
              setSubjectCursorPos(event.currentTarget.selectionStart || 0);
            }}
            onFocus={(e) => {
              setSubjectCursorPos(e.currentTarget.selectionStart || 0)
              setSmsCursorPos(-1)
            }}
            // onBlur={() => setSubjectCursorPos(-1)}
            mt={0}
            w={500}
            maw={'80%'}
            label={'Subject/Title'}
            mb={'sm'}
        />


        <Flex direction={'column'}>
          {/*<Flex mb={'sm'} w={'100%'} align={'end'} justify={'space-between'}>
          </Flex>*/}
          <Box>

            <ScRichTextEditor
                value={emailEditorContentHtml}
                onChange={(updatedContent) => setEmailEditorContentHtml(updatedContent)}
                replacementTagOptions={replacementTagOptions}
                errorMessage={contentErrorMessage}
                maxHeight={'80vh'}
                stickyOffset={60}
                showHtmlEditButton
            />

            <SCTextArea
                autosize
                maxRows={14}
                rows={3}
                maw={'100%' as any}
                label={'SMS text'}
                description={
                  <Text size={'11px'}>
                    {
                      form.values.SMSBody?.length > 120 ? <>PLEASE NOTE: SMS&apos;s longer than 160 characters will incur
                        additional credits &nbsp;&nbsp;&nbsp;&nbsp;</> : ''
                    }
                    {
                      form.values.SMSBody?.includes('{{') && form.values.SMSBody?.includes('}}') ? 'Est. characters: ' : 'Characters: '
                    }
                    <span
                        style={{color: form.values.SMSBody?.length > MAX_SMS_CHAR ? 'var(--mantine-color-yellow-7)' : 'inherit'}}>{form.values.SMSBody?.length}</span>
                    &nbsp;(max {MAX_SMS_CHAR})
                  </Text>
                }
                {...form.getInputProps('SMSBody')}
                rightSection={
                  <Tooltip
                      color={'dark'}
                      label={'Insert replacement tag'}
                      openDelay={1000}
                  >
                    <Menu shadow="md" width={350}
                          trapFocus={false}
                          position={'left'}
                    >
                      <Menu.Target>
                        <ActionIcon
                            variant={'transparent'}
                            color={'dark'}
                            onClick={returnFocus}
                        >
                          <IconCodePlus
                              stroke={1.2}
                              size={22}
                          />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {replacementTagOptions((rt, e) => {
                          e.preventDefault();
                          form.setFieldValue('SMSBody', form.values.SMSBody?.substring(0, smsCursorPos) + '{{' + rt.Name + '}}' + form.values.SMSBody?.substring(smsCursorPos));
                          // setSmsCursorPos(p => p + rt.Name.length + 4)
                          returnFocus();
                        })}
                      </Menu.Dropdown>
                    </Menu>
                  </Tooltip>
                }
                onChange={event => {
                  form.getInputProps('SMSBody').onChange(event);
                  setSmsCursorPos(event.currentTarget.selectionStart || 0);
                }}
                onFocus={(e) => {
                  setSmsCursorPos(e.currentTarget.selectionStart || 0)
                  setSubjectCursorPos(-1)
                }}
                mb={'md'}
                // mt={0}
            />
          </Box>

        </Flex>

      </form>

      {
          !props.fromExternalModule &&
          <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions}/>
      }
    </Box>
  );
};

export default EditTemplate;