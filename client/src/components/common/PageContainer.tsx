import { Box, Container, Paper } from '@mui/material';
import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '80vh',
        }}
      >
        <Box>{children}</Box>
      </Paper>
    </Container>
  );
};

export default PageContainer;
