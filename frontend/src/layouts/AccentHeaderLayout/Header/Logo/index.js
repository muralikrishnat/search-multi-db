import { Tooltip, styled } from '@mui/material';
import { Link } from 'react-router-dom';

const LogoWrapper = styled(Link)(
  ({ theme }) => `
        color: ${theme.colors.alpha.trueWhite[100]};
        padding: ${theme.spacing(0, 1, 0, 0)};
        display: flex;
        text-decoration: none;
        font-weight: ${theme.typography.fontWeightBold};
`
);


function Logo() {

  return (
    <LogoWrapper to="/dashboards">
      <Tooltip
        arrow
        placement="right"
        title="TA Performance Dashboard"
      >
        <img height={48} alt="WebPulsePro" src="/static/images/logo/wppro-white.svg" />
      </Tooltip>
    </LogoWrapper>
  );
}

export default Logo;
