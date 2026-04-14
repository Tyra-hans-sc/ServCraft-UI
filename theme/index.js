import { useMantineTheme } from "@mantine/core";

export const colors =
{
  background: '#FFFFFF',
  backgroundAlt: '#F4F4F4',
  backgroundLegacy: '#F5F8FB',
  backgroundGrey: '#E9ECEE',
  backgroundWarning: '#FFECEF',
  backgroundSuccess: '#ECFFEF',
  blueDark: '#0D4D96',
  blueGrey: '#718FA2',
  blueGreyLight: '#B2C2CD',
  blueHue: '#508ACD',
  bluePrimary: '#003ED0',
  // bluePrimary: 'var(--mantine-color-default-color)',
  bluePrimaryDark: '#001C89',
  // bluePrimaryDark: 'var(--mantine-color-default-hover)',
  bluePrimaryLight: '#0574FE',
  // bluePrimaryLight: 'var(--mantine-color-scBlue-light)',
  borderGrey: '#E0E0E0',
  darkPrimary: '#32353C',
  darkSecondary: '#414143',
  formGrey: '#F0F0F0',
  labelGrey: '#777E82',
  warningRed: '#FC2E50',
  warningRedLight: '#FF7A90',
  white: '#FFFFFF',
  black: '#000000',
  green: '#3CB371',
  lightGreen: '#4cff9c',
  alertOrange: '#F57C00',
  alertOrangeLight: '#FB8C00',
  alertOrangeLightOpaque: 'rgb(253 209 153)',
  subHeading: '#2B2B2B',
  tabContainer: '#2B3136',
  sidebarColor: '#99b2ec',
  sidebarHoverBackground: '#1951d5',
  globalSearchOverlay: '#E5E5E5',
  blueWidget: '#003ED0',
  orangeWidget: '#F57C00',
  greenWidget: '#229B26',
  errorOrange: '#fab005',

  redStatus: '#FC2E50',
  orangeStatus: '#F26101',
  yellowStatus: '#FFC940',
  greenStatus: '#51CB68',
  blueStatus: '#5A85E1',
  purpleStatus: '#735AE1',
  blackStatus: '#4F4F4F',
  greyStatus: '#828282',
  lightGreyStatus: '#BDBDBD',
  lightGreyYellowStatus: '#DDDDBD',
  cyanStatus: '#BDBDBD',

  mantineBorderGrey: '#ced4da',
  mantineBorderBlue: '#228be6',
  mantineErrorOrange: () => {
    const theme = useMantineTheme();
    return theme.colors.yellow[6];
  }
};

export const fontSizes =
{
  body: '1rem',
  label: '12px',
  link: '14px'
}

export const fontFamily = "'Proxima Nova', sans-serif;"
// export const fontFamily = "'Manrope', sans-serif;"

export const layout = {
  bodyRadius: '4px',
  buttonRadius: '3px',
  cardRadius: '4px',
  inputRadius: '3px',
  bigRadius: '8px',
  inputWidth: '490px',
  listCardWidth: '500px'
}

export const shadows =
{
  card: '0px 2px 8px rgb(0 0 0 / 20%)',
  cardDark: '0px 2px 12px rgb(0 0 0 / 30%)',
  cardSmallDark: '0px 4px 8px 0px rgba(51,51,51,0.4)',
  cardSmall: '0px 4px 8px 0px rgba(51,51,51,0.1)',
  widgetCard: '0px 2px 8px rgb(0 0 0 / 20%)',
  combobox: '0 0 3px 1px #00000040'
}

export const tickSvg = 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxNCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjMzMzMgMUw0Ljk5OTk2IDguMzMzMzNMMS42NjY2MyA1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K")'
export const crossSvg = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEgMSkiPgogICAgPGxpbmUgeDE9IjkuMTg3IiB4Mj0iLjE4NyIgeTE9Ii41ODYiIHkyPSI5LjU4NiIvPgogICAgPGxpbmUgeDE9Ii4xODciIHgyPSI5LjE4NyIgeTE9Ii41ODYiIHkyPSI5LjU4NiIvPgogIDwvZz4KPC9zdmc+Cg==")'
