import * as React from 'react';
import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
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
import { mainListItems, secondaryListItems } from '../../components/Dashboard/listItems';
import Footer from '../../components/Footer';
import WehiLogo from '../../assets/logos/wehi-logo.png';
import MelbUniLogo from '../../assets/logos/unimelb-logo.png';
import Tooltip from '@mui/material/Tooltip';

import { useDispatch } from 'react-redux';
import { logout } from '../../actions/authActions'

// Generate Order Data, this will be replaced with data from the backend
function createData(id, dId, date, name, source) {
    return { id, dId, date, name, source};
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const rows = [
    createData(5, 'BIOL10001', '16 Aug, 2024', 'GeneFlow', 'University of Melbourne'),
    createData(2, 'GENE10002', '16 Jun, 2024', 'BioSpectrum', 'cBioPortal'),
    createData(10, 'BIOL10001', '16 Aug, 2024', 'GeneFlow', 'University of Melbourne'),
    createData(1, 'GENE10001', '26 Jun, 2024', 'VitalMetrics', 'University of Melbourne'),
    createData(12, 'GENE10002', '16 Jun, 2024', 'BioSpectrum', 'cBioPortal'),
    createData(7, 'GENE10002', '16 Jun, 2024', 'BioSpectrum', 'cBioPortal'),
    createData(14, 'GENE10003', '15 Apr, 2024', 'GenomicAtlas', 'USYD'),
    createData(0, 'BIOL10001', '16 Aug, 2024', 'GeneFlow', 'University of Melbourne'),
    createData(9, 'GENE10003', '15 Apr, 2024', 'GenomicAtlas', 'USYD'),
    createData(11, 'GENE10001', '26 Jun, 2024', 'VitalMetrics', 'University of Melbourne'),
    createData(6, 'GENE10001', '26 Jun, 2024', 'VitalMetrics', 'University of Melbourne'),
    createData(3, 'BIOL10006', '16 May, 2024', 'CellBase', 'WEHI'),
    createData(4, 'GENE10003', '15 Apr, 2024', 'GenomicAtlas', 'USYD'),
    createData(8, 'BIOL10006', '16 May, 2024', 'CellBase', 'WEHI'),
    createData(13, 'BIOL10006', '16 May, 2024', 'CellBase', 'WEHI'),
  ];
  
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

export default function SingleDataset() {

  const { id: datasetId } = useParams();
  console.log(datasetId);  
  const [newFileOpen, setNewFileOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [slurmOpen, setSlurmOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('IDLE');
  const [summary, setSummary] = useState(null);
  const [datasetData, setDatasetData] = useState(null);
  const [rawDataLocation, setRawDataLocation] = useState("");
  const [rawFiles, setRawFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [summaryFiles, setSummaryFiles] = useState([]);
  const [readmeFiles, setReadmeFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [datasetUrls, setDatasetUrls] = useState([]);

  // Fetch dataset from backend
  React.useEffect(() => {
    const fetchDataset = async () => {
      try {
        const response = await fetch(`${BASE_URL}/datasets_with_metadata/${datasetId}`);
        if (!response.ok) throw new Error("Failed to fetch dataset details");
        const data = await response.json();
        setDatasetData(data);

        const meta = data.metadata?.reduce((acc, m) => {
          acc[m.key] = m.value;
          return acc;
        }, {});

        const locationMeta = data.metadata?.find((m) => m.key === "location")?.value || "";
        setRawDataLocation(locationMeta);

        const parseFiles = (val) =>
          val ? val.split(",").map((f) => f.trim()).filter(Boolean) : [];
  
        setRawFiles(parseFiles(meta.raw_files));
        setProcessedFiles(parseFiles(meta.processed_files));
        setSummaryFiles(parseFiles(meta.summary_files));
        setReadmeFiles(parseFiles(meta.readme_files));
  
      } catch (err) {
        console.error("Error fetching dataset:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchExternalLinks = async () => {
      try {
        const response = await fetch(`${BASE_URL}/${datasetId}/external-links`);
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
  
    fetchDataset();
    fetchExternalLinks();
  }, [datasetId]);

  // Helper function to format URL key into readable label
  const formatUrlLabel = (key) => {
    // Remove 'url_' prefix and convert underscores to spaces, capitalize words
    return key
      .replace(/^url_/, '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const fileInputRef = useRef(null);

  // Format as Python code
  const pythonCode = `import os

      base_path = '${rawDataLocation}'

      raw_files = [${(rawFiles ?? []).map(f => `'${f}'`).join(", ")}]
      processed_files = [${(processedFiles ?? []).map(f => `'${f}'`).join(", ")}]
      summary_files = [${(summaryFiles ?? []).map(f => `'${f}'`).join(", ")}]
      summary_files = [${(readmeFiles ?? []).map(f => `'${f}'`).join(", ")}]
      `;
  
  const rCode = `
      # Define the base path
      base_path <- "${rawDataLocation}"
  
      # Define the raw file array
      raw_file_array <- c(
        ${rawFiles.map(file => `"${file}"`).join(",\n  ")}
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

  const handleFileChangeAndUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataset_id', datasetId)

    try {
      const res = await fetch(`${BASE_URL}/ingest/upload_file_metadata`, {
        method: 'POST',
        body: formData,
      })

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.detail || 'Upload failed');
      }

      setSummary(response.summary);
      setUploadStatus("SUCCESS");

    } catch (err) {
      setUploadStatus("ERROR");
    } finally {
      event.target.value = null;
    }
  
  }

  const handleSelectFileClick = () => {
    fileInputRef.current.click();
  }

  const handleCloseNewFile = () => {
    setNewFileOpen(false);
  }

  const handleResetDialog = () => {
    setUploadStatus('IDLE');
    setSummary(null);
  }

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    navigate('/login'); // Redirect to the login page
  };

  // Function to open the dialog
  const handleOpenPop = () => {
    setSlurmOpen(true);
  };

  // Function to close the dialog
  const handleClosePop = () => {
    setSlurmOpen(false);
  };

  const handleOpenNewFile = () => {
    setNewFileOpen(true);
  };

  const handleCloseUpdate = () => {
    setNewFileOpen(false);
  }

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
              {/* Data Registry for Project {datasetData?.project_id || 1} */}
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
                    
                    {/* Left panel — dataset details */}
                    <Grid item xs={8} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Paper sx={{ p: 4, flexGrow: 1 }}>
                    {loading ? (
                          <Typography>Loading dataset...</Typography>
                        ) : (
                          <>
                            <Typography variant="h4" gutterBottom>
                              {datasetData?.name || "Untitled Dataset"}
                            </Typography>

                            <Typography variant="h6" sx={{ color: 'gray', lineHeight: '2' }} gutterBottom>
                            {datasetData?.displayId || `P${datasetData?.project_id}-${String(datasetData?.id).padStart(3, '0')}`}
                            </Typography>

                            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                              {datasetData?.abstract ||
                                "No abstract provided for this dataset. Please update the record to include details."}
                            </Typography>

                            <Button
                              variant="outlined"
                              sx={{ mr: 2, mt: 3 }}
                              onClick={handleOpenNewFile}
                            >
                              Update Data Registry
                            </Button>
                          </>
                        )}
                      </Paper>
                    </Grid>

                    <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Paper sx={{ p: 4, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Raw Data</Typography>

                        {/* use the following line of code if there is an existing json file for TDE0001 */}
                        {/*<Typography variant="body2">Located: WEHI Milton {dataset.data.location}</Typography> */}

                        <Typography variant="body2">
                          Located: {datasetData?.site || "Unknown site"} {rawDataLocation}
                        </Typography>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Copy code for raw data</Typography>

                        <Button variant="outlined" sx={{ mr: 2, mt: 1 }} onClick={handleCopyPython}>WEHI Jupyter Notebook</Button>

                        <Button variant="outlined" sx={{ mr: 2, mt: 1 }} onClick={handleOpenPop}>SLURM pre-processing</Button>
                        {/* Dialog (Popup) */}
                        <Dialog open={slurmOpen} onClose={handleClosePop} maxWidth="sm" fullWidth >
                          
                          <DialogContent>
                            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Run SLURM pre-processing</DialogTitle>
                              <Typography variant="body1"><b>Run number:</b> TDE0005-002</Typography>
                              <Typography variant="body1"><b>Pre-processing script:</b> /vast/projects/TDE/scripts/cfDNA_pre-processing.sh</Typography>
                              <Typography variant="body1"><b>Directory:</b> /vast/projects/TDE/TDE0005</Typography>
                              <Typography variant="body1"><b>Configuration file:</b> /vast/projects/TDE/TDE0005/pre-processing/TDE0005-002.ini</Typography>
                              <Typography variant="body1"><b>Output directory:</b> /vast/projects/TDE/TDE0005/processed/TDE0005-002/</Typography>
                              <Typography variant="body1"><b>Log file:</b> /vast/projects/TDE/TDE0005/processed/TDE0005-002/out.log</Typography>
                            </Paper>
                          </DialogContent>

                          {/* Close Button */}
                          <DialogActions>
                            <Button onClick={handleClosePop} variant="contained" color="error">Close</Button>
                          </DialogActions>
                        </Dialog>
                      
                        <Button variant="outlined" sx={{ mt: 1 }} onClick={handleCopyR}>WEHI RStudio</Button>
                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Data Portals</Typography>

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
                        {/*<Button variant="outlined" sx={{ mr: 2, mt: 1 }} onClick={() => navigate('/dashboard')}>All Samples View</Button> */}
                        <Button variant="outlined" sx={{ mr: 2, mt: 1 }} onClick={() => navigate('/datasets')}>All Datasets View</Button>
                        <Button variant="outlined" sx={{ mr: 2, mt: 1 }} onClick={() => navigate('/patients')}>All Samples Summary</Button>

                        {/* hard coded */}
                        <Button variant="outlined" sx={{ mt: 1 }} onClick={() => navigate(`/dataset/details/${datasetId}`)}>Files for this dataset</Button>
                    </Paper>
                    </Grid>
                </Grid>
                <Footer />
            </Container>

        </Box>
      </Box>

      <Dialog open={newFileOpen} onClose={handleCloseUpdate} TransitionProps={{ onExited: handleResetDialog }}
      fullWidth maxWidth='sm'>
        <DialogTitle variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', py: 4}}>
          {uploadStatus === 'IDLE' && "How to update Data Registry"}
          {uploadStatus === 'SUCCESS' && 'TDE0005 updated'}
          {uploadStatus === 'ERROR' && 'Upload error'}
        </DialogTitle>
        <DialogContent>
          {uploadStatus === 'IDLE' && (
            <>
              <DialogContentText variant="body1" sx={{color: 'black'}}>
                Go to {datasetData?.site || "Unknown site"} {rawDataLocation}
                <br/><br/>
                You will need to run the update_local.sh script on the command line. <a href="https://github.com/lara-pawar/REDMANE-metadata-generator-with-RO-Crate" target='_blank'>[Click here if you need help]</a>
                <br/><br/>
                This will create an output.html and output.json file.
                <br/><br/>
                Once you run the script, please review the output.html file.
                <br/><br/>
                Once you are satisfied that the html file is OK, click on the button below to upload output.json. You can also use
                update_data_registry.sh to upload the output.json file
              </DialogContentText>

              <input
                type='file'
                accept='.json'
                hidden
                ref={fileInputRef}
                onChange={handleFileChangeAndUpload}
              />

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant="outlined" onClick={handleSelectFileClick} sx={{ mt: 3, mb: 2}} >Upload output.json file</Button>
              </Box>
            </>
          )}

          {uploadStatus === 'SUCCESS' && (
            <>
              <DialogContentText variant="body1" sx={{color: 'black'}}>
                The Data Registry TDE0005 (id: {datasetId}) has been updated.
                <br/><br/>
                {summary.raw_files.count} new raw files (*.fastq, *.fasta) were registed with {summary.raw_files.total_size}{summary.file_size_unit}
                <br/><br/>
                {summary.processed_files.count} new processed files (*.cram, *.bam) were registed with {summary.processed_files.total_size}{summary.file_size_unit}
                <br/><br/>
                {summary.summarised_files.count} new summarised files (*.vcf, *.maf) were registed with {summary.summarised_files.total_size}{summary.file_size_unit}
                <br/><br/>
                Receipt number is 78746776433
              </DialogContentText>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant="outlined" onClick={handleCloseNewFile} sx={{ mt: 3, mb: 2 }} >Close</Button>
              </Box>
            </>
          )}

          {uploadStatus === 'ERROR' && (
            <>
              <DialogContentText variant="body1" sx={{color: 'black'}}>
                Error uploading file. Make sure you are selecting the correct output.json file.
              </DialogContentText>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant="outlined" onClick={handleCloseNewFile} sx={{ mt: 3, mb: 1 }} >Close</Button>
              </Box>
            </>
          )}

        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

