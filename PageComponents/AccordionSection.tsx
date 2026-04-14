import { Accordion, AccordionControlProps, Text } from "@mantine/core";
import { FC, PropsWithChildren, ReactNode } from "react";

/* this control renders one accordion item that can be expanded or collapsed independently */
const AccordionSection: FC<
  PropsWithChildren<{ label: string; stayOpen?: boolean; initiallyOpen?: boolean; chevron?: ReactNode } & AccordionControlProps>
> = ({ label, stayOpen, initiallyOpen = true, chevron, children, ...controlProps }) => {
  return (
    <Accordion
      value={stayOpen ? "x" : undefined}
      defaultValue={!stayOpen && initiallyOpen ? "x" : undefined}
      miw={0}
      style={{
        flexGrow: 1,
        width: "100%",
      }}
      styles={{
        control: {
          width: "100%",
          borderBottom: "1px solid #E5E5E5",
          padding: '0 12px 0 5px',
        },
        label: {
          padding: "12px 0",
        },
        item: {
          border: 0,
          padding: 0,
        },
      }}
      // Provide a custom chevron only in stayOpen mode; allows external caret control
      chevron={stayOpen ? chevron ?? <></> : undefined}
    >
      <Accordion.Item value="x">
        <Accordion.Control {...controlProps}>
          <Text c={"dark.7"} fw={700} size={"14px"}>
            {label}
          </Text>
        </Accordion.Control>
        <Accordion.Panel>{children}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default AccordionSection;


