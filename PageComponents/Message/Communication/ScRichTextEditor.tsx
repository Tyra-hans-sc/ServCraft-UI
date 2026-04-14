import React, {useEffect, useMemo, useState} from "react";
import { RichTextEditor } from "@mantine/tiptap";
import { useDidUpdate } from "@mantine/hooks";
import {FileButton, Menu, ScrollArea, Text as MantineText} from "@mantine/core";
import {useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import {TextStyle} from "@tiptap/extension-text-style";
import { Color } from '@tiptap/extension-color';
import Document from '@tiptap/extension-document'
import Dropcursor from '@tiptap/extension-dropcursor'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import {FontFamily} from "@tiptap/extension-font-family";
import {
    IconCodePlus, IconHtml, IconLineDotted, IconPhoto, IconPhotoBolt,
} from "@tabler/icons-react";
import ScRichTextEditorRawHtmlEditor from "@/PageComponents/Message/Communication/ScRichTextEditorRawHtmlEditor";
import Link from "@tiptap/extension-link";

interface ReplacementTag {
  Group: string;
  Name: string;
  Description: string;
  Module: null | number;
}

interface ScRichTextEditorProps {
  value: string;
  forceNewContentValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  replacementTagOptions?: (onSelect: (replacementTag: ReplacementTag, event: any) => void) => JSX. Element;
  errorMessage?: string | null;
  stickyOffset?: number;
  minHeight?: number;
  maxHeight?: number | string;
  showHtmlEditButton?: boolean;
    setIsEmpty?: (empty: boolean) => void;
    required?: boolean;
}

const CustomTextStyle = TextStyle.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            style: {
                default: null,
                parseHTML: (element) => {
                    console.log(element, element.getAttribute('style'), this.parent?.())
                    return element.getAttribute('style')
                },
                renderHTML: (attributes) => {
                    if (!attributes.style) {
                        return {};
                    }
                    return {
                        style: attributes.style,
                    };
                },
            },
            class: {
                default: null,
                parseHTML: (element) => element.getAttribute('class'),
                renderHTML: (attributes) => {
                    if (!attributes.class) {
                        return {};
                    }
                    return {
                        class: attributes.class,
                    };
                },
            },
            // Add any other custom attributes here
        };
    },
});

const CustomParagraph = Paragraph.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            style: {
                default: null,
                parseHTML: (element) => {
                    console.log(element, element.getAttribute('style'), this.parent?.())
                    return element.getAttribute('style')
                },
                renderHTML: (attributes) => {
                    if (!attributes.style) {
                        return {};
                    }
                    return {
                        style: attributes.style,
                    };
                },
            },
            class: {
                default: null,
                parseHTML: (element) => element.getAttribute('class'),
                renderHTML: (attributes) => {
                    if (!attributes.class) {
                        return {};
                    }
                    return {
                        class: attributes.class,
                    };
                },
            },
            // Add any other custom attributes here
        };
    },
});

const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            src: {
                default: null,
                parseHTML: (element) => element.getAttribute('src'),
                renderHTML: (attributes) => {
                    if (!attributes.src) {
                        return {};
                    }
                    return {
                        src: attributes.src,
                    };
                },
            },
            alt: {
                default: null,
                parseHTML: (element) => element.getAttribute('alt'),
                renderHTML: (attributes) => {
                    if (!attributes.alt) {
                        return {};
                    }
                    return {
                        alt: attributes.alt,
                    };
                },
            },
            style: {
                default: null,
                parseHTML: (element) => element.getAttribute('style'),
                renderHTML: (attributes) => {
                    if (!attributes.style) {
                        return {};
                    }
                    return {
                        style: attributes.style,
                    };
                },
            },
            class: {
                default: null,
                parseHTML: (element) => element.getAttribute('class'),
                renderHTML: (attributes) => {
                    if (!attributes.class) {
                        return {};
                    }
                    return {
                        class: attributes.class,
                    };
                },
            },
            width: {
                default: null,
                parseHTML: (element) => element.getAttribute('width'),
                renderHTML: (attributes) => {
                    if (!attributes.width) {
                        return {};
                    }
                    return {
                        width: attributes.width,
                    };
                },
            },
            height: {
                default: null,
                parseHTML: (element) => element.getAttribute('height'),
                renderHTML: (attributes) => {
                    if (!attributes.height) {
                        return {};
                    }
                    return {
                        height: attributes.height,
                    };
                },
            },
            // Add any other custom attributes you might need
        };
    },
});

const ScRichTextEditor: React.FC<ScRichTextEditorProps> = ({
    value,
    forceNewContentValue,
    onChange,
    placeholder = "",
    replacementTagOptions,
    errorMessage = null,
    stickyOffset = 0,
    minHeight = 100,
    maxHeight = 400,
    showHtmlEditButton = false,
    setIsEmpty,
    required
}) => {
  const [editorTouched, setEditorTouched] = useState(false);

  const editor = useEditor({
      /*enableContentCheck: false,
        enableInputRules: false,
        enableCoreExtensions: false,
        editorProps: {

        },*/
      extensions: [
          FontFamily,
          StarterKit,
          Underline,
          Link,
          Superscript,
          Subscript,
          Highlight,
          CustomTextStyle,
          Document,
          CustomParagraph,
          // Text,
          CustomImage.configure({
              inline: true,
              allowBase64: true,
              HTMLAttributes: {
                  style: 'max-width: 400px; max-height: 300px; object-fit: contain; object-position: center;', // prevent images from being too big on emails
              }
          }),
          Dropcursor,
          TextAlign.configure({types: ["heading", "paragraph"]}),
          Color,
          Table.configure({resizable: true}),
          TableRow,
          TableHeader,
          TableCell,
      ],
      content: value,
      onUpdate: ({editor}) => onChange(editor.getHTML()),
  });

  useDidUpdate(() => {
    editor && setIsEmpty && setIsEmpty(editor.isEmpty)
  }, [editor?.isEmpty]);

  useEffect(() => {
      if(forceNewContentValue) {
          editor?.commands.setContent(forceNewContentValue/*, true, undefined, {errorOnInvalidContent: true}*/)
      }
  }, [forceNewContentValue])


  const requiredError = useMemo(
        () => (required && !editor?.isFocused && editor?.isEmpty && editorTouched ? 'Email content is required' : null),
        [required, editorTouched, editor?.isEmpty, editor?.isFocused]
    )
    // const  = useMemo(() => (errorMessage || null), [errorMessage]);

  const editorError = errorMessage || requiredError;

  useDidUpdate(() => {
    if (editor?.isFocused && !editorTouched) {
      setEditorTouched(true);
    }
  }, [editor?.isFocused]);


  const [rawHtmlModalOpen, setRawHtmlModalOpen] = useState(false); // State for modal
    // Update editor content directly from modal
    const handleUpdateHtml = (newHtml: string) => {
        if (editor) {
            // editor?.commands.setContent(newHtml)
            /*const json = generateJSON(newHtml, [  Document,
                Paragraph,
                Text,
                FontFamily,
                StarterKit,
                Underline,
                Link,
                Superscript,
                Subscript,
                Highlight,
                TextStyle,
                Document,
                Paragraph,
                Text,
                Image.configure({
                    inline: true,
                    allowBase64: true,
                    HTMLAttributes: {
                        style: 'max-width: 400px; max-height: 300px; object-fit: contain; object-position: center;', // prevent images from being too big on emails
                    }
                }),
                Dropcursor,
                TextAlign.configure({types: ["heading", "paragraph"]}),
                Color,
                Table.configure({resizable: true}),
                TableRow,
                TableHeader,
                TableCell
            ])*/
            editor?.commands.setContent(newHtml/*, true, undefined, {errorOnInvalidContent: true}*/)
        }
        setRawHtmlModalOpen(false); // Close the modal
    };

    const handleFileUpload = (payload: File[]) => {
        payload.forEach(file => {
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    if (reader.result && typeof reader.result === "string") {
                        // Insert the Base64 image into the editor
                        editor?.commands.setImage({ src: reader.result });
                    }
                };
                reader.readAsDataURL(file); // Read file as Base64
            }
        })
    };

    const addImage = () => {

        if(editor) {
            const url = window.prompt('URL')
            if (url) {
                editor.chain().focus().setImage({ src: url }).run()
                /*editor.chain().focus().setContent(`
                    <img src="${url}" style="max-width: 50px">
                `).run()*/

                /*editor.chain().focus().insertContent(`
                    <img 
                      src="${url}" 
                      style="max-width: 400px; max-height: 300px; object-fit: cover; display: block; margin: 0 auto;" 
                    />
                  `).run();*/
            }
        }
    }


    return (
    <div>
      <RichTextEditor
        editor={editor}
        style={{
          borderColor: editorError ? "var(--mantine-color-yellow-6)" : "",
        }}
      >
        {/*{editor && (
            <BubbleMenu editor={editor}>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Link />
              </RichTextEditor.ControlsGroup>
            </BubbleMenu>
        )}*/}
      {/*{editor && (
          <FloatingMenu editor={editor}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.BulletList />
            </RichTextEditor.ControlsGroup>
          </FloatingMenu>
      )}*/}
      <RichTextEditor.Toolbar sticky stickyOffset={stickyOffset}>
          {/* Basic formatting */}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Highlight />
            <RichTextEditor.ColorPicker
                colors={[
                  '#25262b',
                  '#868e96',
                  '#fa5252',
                  '#e64980',
                  '#be4bdb',
                  '#7950f2',
                  '#4c6ef5',
                  '#228be6',
                  '#15aabf',
                  '#12b886',
                  '#40c057',
                  '#82c91e',
                  '#fab005',
                  '#fd7e14',
                ]}
            />
          </RichTextEditor.ControlsGroup>

          {/* Headings */}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          {/* Lists and Quotes */}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr icon={IconLineDotted} />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Subscript />
            <RichTextEditor.Superscript />
          </RichTextEditor.ControlsGroup>

          {/* Alignments */}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>

          {/* Undo/Redo */}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>

          {/* Image Buttons */}
          {/*<RichTextEditor.ControlsGroup>
              <RichTextEditor.Control
                  onClick={() => addImage()}
                  style={{ gap: 5, paddingInline: 3 }}
              >
                  <IconPhoto stroke={1.4} size={17} />
              </RichTextEditor.Control>
              <FileButton onChange={handleFileUpload} accept="image/png,image/jpeg" multiple>
                  {(props) =>
                      <RichTextEditor.Control
                          {...props}
                      >
                          <IconPhotoBolt stroke={1.4} size={17} />
                      </RichTextEditor.Control>
                  }
              </FileButton>
          </RichTextEditor.ControlsGroup>*/}

          {/* Edit HTML Button */}
          {
              showHtmlEditButton &&
              <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Control
                      onClick={() => setRawHtmlModalOpen(true)}
                      style={{ gap: 5, paddingInline: 3 }}
                  >
                      <IconHtml stroke={1.4} size={17} />
                  </RichTextEditor.Control>
              </RichTextEditor.ControlsGroup>
          }

          {/* Replacement Tag */}
          {replacementTagOptions && (
            <RichTextEditor.ControlsGroup ml={"auto"}>
              <Menu shadow="md" width={350} trapFocus={false} position={"left"}>
                <Menu.Target>
                  <RichTextEditor.Control style={{ gap: 5, paddingInline: 3 }}>
                    <IconCodePlus stroke={1.2} size={22} />
                    <MantineText size={"xs"}>Replacement Tag</MantineText>
                  </RichTextEditor.Control>
                </Menu.Target>
                <Menu.Dropdown>
                  {replacementTagOptions((rt, e) => {
                    e.preventDefault();  // prevent event bubbling
                    editor?.commands.insertContent('{{' + rt.Name + '}}')
                    editor?.commands.focus()
                  })}
                </Menu.Dropdown>
              </Menu>
            </RichTextEditor.ControlsGroup>
          )}
        </RichTextEditor.Toolbar>

          <ScrollArea.Autosize
              mah={maxHeight}
          >
              <RichTextEditor.Content
                  mih={minHeight}
                  placeholder={placeholder}
                  onClick={() => !editor?.isFocused && editor?.commands.focus()}
              />
          </ScrollArea.Autosize>
      </RichTextEditor>
      {editorError && <MantineText mt={5} size={"11px"} c={"yellow.6"}>{editorError}</MantineText>}


        {/* HTML Modal */}
        {editor && rawHtmlModalOpen && (
            <ScRichTextEditorRawHtmlEditor
                html={editor.getHTML()}
                onUpdate={handleUpdateHtml}
                open={rawHtmlModalOpen}
            />
        )}

    </div>
  );
};

export default ScRichTextEditor;