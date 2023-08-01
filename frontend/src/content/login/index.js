import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  Link,
  Typography,
  Container,
  styled
} from '@mui/material';

const MainContent = styled(Box)(
  () => `
    height: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
`
);

const TopWrapper = styled(Box)(
  () => `
  display: flex;
  width: 100%;
  flex: 1;
  padding: 20px;
`
);

function LoginBasic() {
 
  return (
    <>
      <MainContent>
        <TopWrapper>
          <Container maxWidth="sm">
            <Box display="flex" justifyContent="center" sx={{paddingBlock:'30px'}}>
              <img height={60} alt="WebPulsePro" src="/static/images/logo/javascript.svg" />
            </Box>
            <Card
              sx={{
                mt: 3,
                px: 4,
                pt: 5,
                pb: 3
              }}
            >
              <Box>
                <Typography
                  variant="h2"
                  sx={{
                    mb: 1
                  }}
                >
                  Sign in
                </Typography>
                <Typography
                  variant="h4"
                  color="text.secondary"
                  fontWeight="normal"
                  sx={{
                    mb: 3
                  }}
                >
                  Fill in the fields below to sign into your account.
                </Typography>
              </Box>
              <Box>Login form </Box>
              <Box my={4}>
                <Typography
                  component="span"
                  variant="subtitle2"
                  color="text.primary"
                  fontWeight="bold"
                >
                  Don’t have an account, yet?
                </Typography>{' '}
                <Link component={RouterLink} to="/account/register-basic">
                  <b>Sign up here</b>
                </Link>
              </Box>
            </Card>

          </Container>
        </TopWrapper>
      </MainContent>
    </>
  );
}

export default LoginBasic;