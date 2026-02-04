import { useState, useEffect } from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate, useParams } from 'react-router-dom';
import { mainListItems, secondaryListItems } from '../../components/Dashboard/listItems';
import Footer from '../../components/Footer';
import WehiLogo from '../../assets/logos/wehi-logo.png';
import MelbUniLogo from '../../assets/logos/unimelb-logo.png';
import Tooltip from '@mui/material/Tooltip';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { useDispatch } from 'react-redux';
import { logout } from '../../actions/authActions'
import dataset from '../../assets/testjson/output.json';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Generate Order Data, this will be replaced with data from the backend
  function preventDefault(event) {
    event.preventDefault();
  }

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: '#00274D', // Change the background color
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7.5),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(7),
        },
      }),
    },
  }),
);

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function DatasetDetails() {
  
  const { id: dataset_id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fileType, setFileType] = useState('All');
  const [open, setOpen] = useState(false);
  const [slurmOpen, setSlurmOpen] = useState(false);
  const [datasetUrls, setDatasetUrls] = useState([]);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const [files, setFiles] = useState([]);

  const transformAPIData = (apiData) => {
    return apiData.map(file => {
      const flatFile = {
        id: file.id,
        file_type: file.file_type,
        fileName: 'N/A',
        fileSize: 'N/A',
        organisation: 'N/A',
        patientId: 'N/A',
        sampleId: 'N/A'
      };

      for (const meta of file.metadata) {
        if (meta.metadata_key === 'file_name') {
          flatFile.fileName = meta.metadata_value;
        } else if (meta.metadata_key === 'file_size') {
          flatFile.fileSize = meta.metadata_value;
        } else if (meta.metadata_key === 'organization') {
          flatFile.organisation = meta.metadata_value;
        } else if (meta.metadata_key === 'patient_id') {
          flatFile.patientId = meta.metadata_value;
        } else if (meta.metadata_key === 'sample_id') {
          flatFile.sampleId = meta.metadata_value;
        }
      }

      return flatFile;
    });
  };

  useEffect(() => {
    const fetchFilesForDataset = async () => {
      try {
        const response = await fetch(`${BASE_URL}/dataset_files_metadata/${dataset_id}`);

        const res = await response.json()
        
        if (!response.ok) {
          throw new Error(res.detail || 'Failed to fetch files');
        }

        setFiles(transformAPIData(res));
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };

    const fetchExternalLinks = async () => {
      try {
        const response = await fetch(`${BASE_URL}/${dataset_id}/external-links`);
        if (response.ok) {
          const linksData = await response.json();
          // Transform API response to match display format
          const urls = linksData.links.map((link) => ({
            key: link.key,
            url: link.url,
            label: formatUrlLabel(link.key)
          }));
          setDatasetUrls(urls);
        }
      } catch (err) {
        console.warn("Error fetching external links:", err);
      }
    };

    fetchFilesForDataset();
    fetchExternalLinks();
  }, [dataset_id]);

  // Helper function to format URL key into readable label
  const formatUrlLabel = (key) => {
    // Remove 'url_' prefix and convert underscores to spaces, capitalize words
    return key
      .replace(/^url_/, '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredFiles = files.filter(file => {
    if (fileType === 'All') {
      return true;
    }
    
    return file.file_type.toLowerCase() === fileType.toLowerCase()
  })
  
  // Extract data dynamically from the dataset
  const rawFiles = dataset.data.files.raw.map(file => ({
    filename: file.file_name,
    sampleId: file.sample_id,
    patientId: file.patient_id,
    location: 'WEHI', // Hardcoded for now; update if necessary
    size: `${file.file_size}`, // Assuming file_size is in KB
    redcap: 0 // Defaulting REDCap complete to 0; update if needed
  }));

  const dataFileUnit = dataset.data.file_size_unit;
  
  const rawDataLocation = dataset.data.location; // Extract base path
  const rawFilesDirectory = dataset.data.files.raw.map(file => file.directory); // Extract file paths without extra quotes

  // **Calculate Total Number of Files**
  const totalFiles = rawFiles.length;

  const totalFileSize = dataset.data.files.raw
  .map(file => Number(file.file_size)) // Ensure numbers
  .reduce((acc, size) => acc + size, 0); // Sum them up

  // Format as Python code
  const pythonCode = `import os\n\nbase_path = '${rawDataLocation}'\nraw_file_array = [\n  ${rawFilesDirectory.map(file => `'${file}'`).join(",\n  ")}\n]\n`;
  
  const rCode = `
      # Define the base path
      base_path <- "${rawDataLocation}"
  
      # Define the raw file array
      raw_file_array <- c(
        ${rawFilesDirectory.map(file => `"${file}"`).join(",\n  ")}
      )
  
      # Combine paths
      file_paths <- paste(base_path, raw_file_array, sep = "")
  
      # Print the file paths
      print(file_paths)
      `;
  


  // Copy function Python
  const handleCopyPython = () => {
    navigator.clipboard.writeText(pythonCode)
      .then(() => alert("Python snippet copied to clipboard!"))
      .catch(err => console.error("Failed to copy:", err));
  };

  // Copy function R
  const handleCopyR = () => {
    navigator.clipboard.writeText(rCode)
      .then(() => alert("R snippet copied to clipboard!"))
      .catch(err => console.error("Failed to copy:", err));
  };

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    navigate('/login'); // Redirect to the login page
  };

  // Function to open the dialog
  const handleOpenSlurm = () => {
    setSlurmOpen(true);
  };

  // Function to close the dialog
  const handleCloseSlurm = () => {
    setSlurmOpen(false);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: '24px', // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              TUFT Data Environment - Data Registry
            </Typography>
            <div style={{ display: 'flex', 
                          alignItems: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 1)' ,
                          padding: '5px',
                          borderRadius: '5px',
                          alignSelf: 'center',
                          marginRight: '10px'
                          }}>
              <img src={WehiLogo} alt="WEHI" width="90" height="30" 
                   style={{marginLeft: '10px', marginRight: '10px' }} />
            </div>
            <div style={{ display: 'flex', 
                          alignItems: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 1)' ,
                          padding: '5px',
                          borderRadius: '5px',
                          alignSelf: 'center',
                          marginRight: '10px'
                          }}>
              <img src={MelbUniLogo} alt="Melbourne University" width="30" height="30"
                   style={{marginLeft: '2px', marginRight: '2px' }} />
            </div>
            <Box sx={{ marginRight: '10px' }}> {/* Adjust the marginLeft value as needed */}
              <Button
               variant="contained"
               color="warning"
               onClick={handleLogout}
               sx={{ textTransform: 'none',
                     padding: '5px 20px', // Increase padding for a bigger button
                     fontSize: '16px', // Increase font size
                     backgroundColor: '#00274D', // Choose a slightly darker or lighter shade of blue
                    '&:hover': {
                    backgroundColor: '#0056b3', // Darker shade for hover state
                    }, 
                  }}
              >
                Log Out
              </Button>
            </Box>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            {mainListItems()}
            <Divider sx={{ my: 1 }} />
            {secondaryListItems()}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            
                <Grid container spacing={3}>
                    
                    <Grid item xs={8} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Paper sx={{ p: 4, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 5}}>
                        <Box sx={{ display: 'flex', flexDirection: 'column'}}>
                          <Typography variant="h5" gutterBottom>
                            File Details for Dataset ID: {dataset_id}
                          </Typography>
                          <Typography variant="h7">{fileType} Files View ({filteredFiles.length} – {
                            filteredFiles.reduce((total,file) => {
                              return total + parseFloat(file.fileSize || 0);
                            }, 0)
                          } KB)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <ToggleButtonGroup
                            color="primary"
                            value={fileType}
                            exclusive
                            sx={{ height: '50px' }}
                            onChange={(event, newFilter) => {
                              if (newFilter !== null) {
                                setFileType(newFilter);
                              }
                            }}
                            aria-label='file type filter'
                          >
                            <ToggleButton value="All">All</ToggleButton>
                            <ToggleButton value="Raw">Raw</ToggleButton>
                            <ToggleButton value="Processed">Processed</ToggleButton>
                            <ToggleButton value="Summarised">Summarised</ToggleButton>

                          </ToggleButtonGroup>
                        </Box>
                      </Box>

                        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 539 }}>
                            <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableHead>
                                <TableRow>
                                <TableCell sx={{ width: '40%', fontWeight: 'bold' }} >Filename</TableCell>
                                <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>Sample ID</TableCell>
                                <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>Patient ID</TableCell>
                                <TableCell sx={{ width: '40%', fontWeight: 'bold' }}>Location</TableCell>
                                <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Size</TableCell>
                                <TableCell sx={{ width: '10%', fontWeight: 'bold' }}>REDCap complete</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredFiles && filteredFiles.length > 0 ? (
                                filteredFiles.map((file) => (
                                <TableRow key={file.id}>
                                    <Tooltip title={file.fileName}>
                                      <TableCell  sx={{
                                          maxWidth: 250,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                      }}>{file.fileName}</TableCell>
                                    </Tooltip>

                                    <Tooltip title={file.sampleId}>
                                      <TableCell  sx={{
                                          maxWidth: 250,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                      }}>{file.sampleId}</TableCell>
                                    </Tooltip>

                                    <Tooltip title={file.patientId}>
                                      <TableCell  sx={{
                                          maxWidth: 250,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                      }}>{file.patientId}</TableCell>
                                    </Tooltip>

                                    <Tooltip title={file.organisation}>
                                      <TableCell  sx={{
                                          maxWidth: 250,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                      }}>{file.organisation}</TableCell>
                                    </Tooltip>

                                    <Tooltip title={`${file.fileSize} ${dataFileUnit}`}>
                                      <TableCell  sx={{
                                          maxWidth: 250,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                      }}>{file.fileSize} {dataFileUnit}</TableCell>
                                    </Tooltip>
                                    <TableCell>0</TableCell>
                                </TableRow>
                                ))    
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={6} align="center">
                                    No files found.
                                  </TableCell>
                                </TableRow>
                              )} 
                            </TableBody>
                            </Table>
                        </TableContainer>

                        
                    </Paper>
                    </Grid>

                    <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Paper sx={{ p: 4, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{fileType} Data</Typography>

                        {/* use the following line of code if there is an existing json file for TDE0001 */}
                        {/*<Typography variant="body2">Located: WEHI Milton {dataset.data.location}</Typography> */}

                        <Typography variant="body2">Located: WEHI Milton /vast/projects/TDE/TDE0001</Typography>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Copy code for raw data</Typography>

                        <Button variant="outlined" sx={{ mr: 2, mt: 1 }} onClick={handleCopyPython}>WEHI Jupyter Notebook</Button>

                        <Button variant="outlined" sx={{ mr: 2, mt: 1 }} onClick={handleOpenSlurm}>SLURM pre-processing</Button>
                        {/* Dialog (Popup) */}
                        <Dialog open={slurmOpen} onClose={handleCloseSlurm} maxWidth="sm" fullWidth >
                          
                          <DialogContent>
                            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Run SLURM pre-processing</DialogTitle>
                              <Typography variant="body1"><b>Run number:</b> TDE0001-002</Typography>
                              <Typography variant="body1"><b>Pre-processing script:</b> /vast/projects/TDE/scripts/cfDNA_pre-processing.sh</Typography>
                              <Typography variant="body1"><b>Directory:</b> /vast/projects/TDE/TDE0001</Typography>
                              <Typography variant="body1"><b>Configuration file:</b> /vast/projects/TDE/TDE0001/pre-processing/TDE0001-002.ini</Typography>
                              <Typography variant="body1"><b>Output directory:</b> /vast/projects/TDE/TDE0001/processed/TDE0001-002/</Typography>
                              <Typography variant="body1"><b>Log file:</b> /vast/projects/TDE/TDE0001/processed/TDE0001-002/out.log</Typography>
                            </Paper>
                          </DialogContent>

                          {/* Close Button */}
                          <DialogActions>
                            <Button onClick={handleCloseSlurm} variant="contained" color="error">Close</Button>
                          </DialogActions>
                        </Dialog>
                      
                        <Button variant="outlined" sx={{ mt: 1 }} onClick={handleCopyR}>WEHI RStudio</Button>
                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Related Links</Typography>

                        {/* Dynamic URL buttons based on database configuration */}
                        {datasetUrls && datasetUrls.length > 0 ? (
                          <Box sx={{ mt: 1 }}>
                            {datasetUrls.map((urlItem) => (
                              <Tooltip key={urlItem.key} title={urlItem.url}>
                                <Button 
                                  variant="outlined" 
                                  sx={{ mr: 1, mb: 1 }} 
                                  component={Link} 
                                  href={urlItem.url} 
                                  target="_blank"
                                  size="small"
                                >
                                  {urlItem.label}
                                </Button>
                              </Tooltip>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No links configured
                          </Typography>
                        )}
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Other views</Typography>
                        <Button variant="outlined" sx={{ mr: 2, mt: 1 }} onClick={() => navigate('/dashboard')}>All Samples View</Button>
                        <Button variant="outlined" sx={{ mr: 2, mt: 1 }} onClick={() => navigate('/datasets')}>All Datasets View</Button>
                        <Button variant="outlined" sx={{ mr: 2, mt: 1 }} onClick={() => navigate('/patients')}>All Samples Summary</Button>

                        {/* hard coded */}
                        <Button variant="outlined" sx={{ mt: 1 }} onClick={() => navigate('/dataset/details/BIOL10001')}>Files for this dataset</Button>
                    </Paper>
                    </Grid>
                </Grid>
                <Footer />
            </Container>

        </Box>
      </Box>
    </ThemeProvider>
  );
}

