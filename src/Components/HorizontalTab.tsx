import * as React from "react";
import { Typography, Box, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/material/styles";
interface TabPanelProps {
    children?: React.ReactNode,
    index: number,
    value: number
}

function TabPanel ({
    index,
    value,
    children,
    ...props
    }: TabPanelProps) {

        return (
            <div
                role="tabpanel"
                hidden={value!==index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...props}
            >
                {value === index && (
                    <Box
                        sx={{minHeight: "100vh"}}
                    >
                        <div>{children}</div>
                    </Box>
                )}
            </div>
        )
}

function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
}

interface TabsProps {
    tabs: Array<string>,
    children?: Array<React.ReactNode>
}

export default function CustomTabs({tabs, children}: TabsProps){ 
    const [value, setValue] = React.useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number)=> {
        setValue(newValue);
    }

    return (
        <Box sx={{width: "100%"}}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={value} onChange={handleChange} aria-label="custom tabs">
                    {tabs.map((tab, tabIndex)=> (
                        <Tab label={tab} {...a11yProps(tabIndex)} key={tab+tabIndex} />
                    ))}
                </Tabs>
            </Box>
                {children?.map((child, childIndex)=> (
                    <TabPanel value={value} index={childIndex} key={childIndex}>
                        {child}
                    </TabPanel>
                ))}
        </Box>
    )
}


