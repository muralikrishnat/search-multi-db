import {
    Button,
    Tooltip
  } from '@mui/material';

  import AddChartIcon from '@mui/icons-material/AddCircleOutline';
  import { useTranslation } from 'react-i18next';

  function AddProject () {

    const { t } = useTranslation();
    // const handleOpen = () => {
    //     //
    // };
    return (
        <Tooltip arrow title={t('Click to create a new Project')}>

            <Button size='large'  variant="contained" color="primary" startIcon={<AddChartIcon />}>
            {t('New Project')}
            </Button>

        </Tooltip>
    )
  }

  export default AddProject;