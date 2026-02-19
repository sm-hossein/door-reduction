//fields of Patio cover form used for geting and setting values to zoho and reduce function 
const PatioFields = [
    { name: 'Width in Inches', id: 'WidthInInches', reductionName: 'Width', zohoName: 'Awning_Width', type: 'input', reductionField: false },
    { name: 'Projection', id: 'Projection', reductionName: 'Projection', zohoName: 'Fixed_Frame_Projection', type: 'input', reductionField: false },
    { name: 'Drop in Inches', id: 'DropInInches', reductionName: 'Drop', zohoName: 'Drop', type: 'input', reductionField: true },
    { name: 'Strip Offset', id: 'Stripoffset', reductionName: '', zohoName: 'StripOffset', type: 'input', reductionField: true },
    { name: 'Cloth Size', id: 'ClothSize', api_name: 'Cloth Size', reductionName: 'ClothSize', zohoName: 'ClothSize', type: 'dropdown', reductionField: true },
    { name: 'Cloth Actual Size', id: 'ClothActualSize', reductionName: 'ClothActualSize', zohoName: 'ClothActualSize', type: 'input', reductionField: true },
    { name: 'Fabric Type', id: 'FabricType', api_name: 'Fabric_Type', reductionName: 'FabricId', zohoName: 'Fabric_Type', type: 'dropdown', reductionField: false },
    { name: 'Fabric Selection', id: 'FabricSelection', api_name: 'Fabric_Selection', reductionName: 'FabricSelection', zohoName: 'Fabric_Selection', type: 'dropdown', reductionField: false },
    { name: 'Binding Color', id: 'BindingColor', api_name: 'Binding_Color', reductionName: 'Binding', zohoName: 'Binding_Color', type: 'dropdown', reductionField: false },
    { name: 'Valance Style', id: 'ValanceStyle', api_name: 'Valance_Style', reductionName: 'ValanceStyle', zohoName: 'Valance_Style', type: 'dropdown', reductionField: false },
    { name: 'Valance Size', id: 'ValanceSize', reductionName: 'ValanceSize', zohoName: 'ValanceSize', type: 'input', reductionField: true },
    { name: 'Frame Color', id: 'FrameColor', api_name: 'Frame_Color', reductionName: 'FrameColorText', zohoName: 'Fixed_Frame_Color', type: 'dropdown', reductionField: false },
    { name: 'End Wing Projection', id: 'EndWingProjection', reductionName: 'EndWingProjection', zohoName: 'EndWingProjection', type: 'input', reductionField: true },
    { name: 'End Wing Style', id: 'EndWingStyle', api_name: 'End Wing Style', reductionName: 'EndWingStyle', zohoName: 'EndWingStyle', type: 'dropdown', reductionField: true },
    { name: 'Post Length', id: 'PostLength', reductionName: 'PostLength', zohoName: 'PostLength', type: 'input', reductionField: true },
    { name: 'Cantilever', id: 'Cantilever', reductionName: 'Cantilever', zohoName: 'Cantilever', type: 'input', reductionField: true },
    { name: 'Post Mounting', id: 'PostMounting', api_name: 'Post Mounting', reductionName: 'PostMounting', zohoName: 'PostMounting', type: 'dropdown', reductionField: true },
    { name: 'Hole Mounting', id: 'HoleMounting', api_name: 'Hole Spacing', reductionName: 'HoleSpacing', zohoName: 'HoleSpacing', type: 'dropdown', reductionField: true },
    { name: 'Post Spacing', id: 'PostSpacing', api_name: 'Post Spacing', reductionName: 'PostSpacing', zohoName: 'PostSpacing', type: 'dropdown', reductionField: true },
    { name: 'Number Of Posts', id: 'NumberOfPosts', reductionName: 'NumberofPosts', zohoName: 'NumberofPosts', type: 'input', reductionField: true },
    { name: 'Note', id: 'reductionNote', reductionName: 'Note', zohoName: 'Note', type: 'input', reductionField: true },
    { name: 'Coversheet Note', id: 'CoversheetNote', reductionName: 'CoversheetNote', zohoName: 'Reduction_Notes', type: 'textarea', reductionField: true, orderLevel: true },
    { name: 'Coversheet Pick', id: 'CoversheetPick', reductionName: 'CoversheetPick', zohoName: 'Awning_Coversheet_Picklist', type: 'multiselect', reductionField: true, orderLevel: true },
]
const PatioCoverFormFields = [
    {
        section: 'Size',
        fields: [
            { name: 'Width in Inches', id: 'WidthInInches', type: 'input' },
            { name: 'Projection', id: 'Projection', type: 'input' },
            { name: 'Drop in Inches', id: 'DropInInches', type: 'input' },
            { name: 'Strip Offset', id: 'Stripoffset', type: 'input' },
            { name: 'Cloth Size', id: 'ClothSize', type: 'dropdown', api_name: 'Cloth Size' },
            { name: 'Cloth Actual Size', id: 'ClothActualSize', type: 'input' },
        ]
    },
    {
        section: 'Fabric/Styles',
        fields: [
            { name: 'Fabric Type', id: 'FabricType', type: 'dropdown', api_name: 'Fabric_Type' },
            { name: 'Fabric Selection', id: 'FabricSelection', type: 'dropdown', api_name: 'Fabric_Selection' },
            { name: 'Binding Color', id: 'BindingColor', type: 'dropdown', api_name: 'Binding_Color' },
            { name: 'Valance Style', id: 'ValanceStyle', type: 'dropdown', api_name: 'Valance_Style' },
            { name: 'Valance Size', id: 'ValanceSize', type: 'input' },
            { name: 'Frame Color', id: 'FrameColor', type: 'dropdown', api_name: 'Fixed_Frame_Color' },
        ]
    },
    {
        section: 'Others',
        fields: [
            { name: 'End Wing Projection', id: 'EndWingProjection', type: 'input' },
            { name: 'End Wing Style', id: 'EndWingStyle', type: 'dropdown', api_name: 'End Wing Style' },
            { name: 'Post Length', id: 'PostLength', type: 'input' },
            { name: 'Cantilever', id: 'Cantilever', type: 'input' },
            { name: 'Post Mounting', id: 'PostMounting', type: 'dropdown', api_name: 'Post Mounting' },
            { name: 'Hole Mounting', id: 'HoleMounting', type: 'dropdown', api_name: 'Hole Spacing' },
            { name: 'Post Spacing', id: 'PostSpacing', type: 'dropdown', api_name: 'Post Spacing' },
            { name: 'Number Of Posts', id: 'NumberOfPosts', type: 'input' },
        ]
    },
    {
        section: 'Note',
        fields: [
            { name: '', id: 'reductionNote', type: 'textarea' },
        ]
    },
    {
        section: 'Coversheet',
        fields: [
            { name: '', id: 'CoversheetNote ', type: 'textarea' },
            { name: '', id: 'CoversheetPick', type: 'multiselect', api_name: 'Awning_Coversheet_Picklist' },
        ]
    },
]
const PatioFabricationInformationFields = [
    { showName: 'Number', name: 'Number' },
    { showName: 'Type', name: 'Type' },
    { showName: 'Width', name: 'Width' },
    { showName: 'Projection', name: 'Projection' },
    { showName: 'Drop', name: 'Drop' },
    { showName: 'Frame Color', name: 'FrameColor' },
    { showName: 'End Wings', name: 'EndWings' },
    { showName: 'Rafter Spacing', name: 'RafterSpacing' },
]

const PatioSewingInformationFields = [
    { showName: 'Total Yardage', name: 'TotalYardage', unit: 'Yards' },
    { showName: 'Material', name: 'Material' },
    { showName: 'Valance', name: 'Valance' },
    { showName: 'Binding', name: 'Binding' },
    { showName: 'Thread', name: 'Thread' },
    { showName: 'Slope Length', name: 'SlopeLength' },
    { showName: 'Panels Cut Length', name: 'PanelCutLength' },
    { showName: 'Number of End Panels', name: 'NumberOfEndPanels' },
    { showName: 'Final Fabric Width', name: 'FinalFabricWidth' },
    { showName: 'Lacer Cut Length', name: 'LacerCutLength' },

]
const PatioOtherInfo = [
    { showName: 'Rafter Length', name: 'RafterLength' },
    { showName: 'End Rafters', name: 'EndRafters' },
    { showName: 'End Proj Rafters', name: 'EndProjRafters' },
    { showName: 'Sliders', name: 'Sliders' },
    { showName: 'Head Rod', name: 'HeadRod' },
    { showName: 'Back Bar', name: 'BackBar' },
    { showName: 'Front Bar', name: 'FrontBar' },
    { showName: 'Posts', name: 'Posts' },
]
//form fields of Door
//api_name: for getting options of dropdowns from zoho
const zipperShadeFields = [
    { name: 'Width in Inches', id: 'WidthInInches', reductionName: 'WidthInInches', zohoName: 'Shade_Width', type: 'input', reductionField: false },
    { name: 'Drop in Inches', id: 'DropInInches', reductionName: 'DropInInches', zohoName: 'Shade_Drop', type: 'input', reductionField: false },
    { name: 'Frame Color', id: 'FrameColor', reductionName: 'FrameColor', zohoName: 'Frame_Color', type: 'dropdown', reductionField: false },
    { name: 'Fabric Color', id: 'FabricColor', reductionName: 'FabricColor', zohoName: 'Shade_Curtain_Color', type: 'dropdown', reductionField: false },
    { name: 'Fabric openness', id: 'ShadeOpenness', reductionName: 'ShadeOpenness', zohoName: 'Shade_Curtain_Openness', type: 'dropdown', reductionField: false },
    // { name: 'Shade Fabric Width', id: 'ShadeFabricWidth', reductionName: 'ShadeFabricWidth', zohoName: 'Shade_Width', type: 'dropdown', reductionField: true },
    { name: 'Shade Fabric Width', id: 'ShadeFabricWidth', reductionName: 'fabricWidth', zohoName: 'fabricWidth', api_name: 'fabricWidth', type: 'dropdown', reductionField: true },
    { name: 'Mount Height', id: 'MountHeight', reductionName: 'MountHeight', zohoName: 'Mounting_Height', type: 'input', reductionField: false },
    { name: 'Mount Type', id: 'MountType', reductionName: 'MountType', zohoName: 'Mounting_type', type: 'dropdown', reductionField: false },
    { name: 'Mount Surface', id: 'MountSurface', reductionName: 'MountSurface', zohoName: 'Mounting_Surface', type: 'dropdown', reductionField: false },
    { name: 'Custom Bracket', id: 'CustomBracket', reductionName: 'CustomBracket', zohoName: 'Custom_bracket_for_LHP_to_manufacture', type: 'checkbox', reductionField: false },
    { name: 'Override Install Time', id: 'OverrideInstallTime', reductionName: 'OverrideInstallTime', zohoName: 'OverrideInstallTime', type: 'decimalInput', reductionField: true },
    { name: 'Location', id: 'Location', reductionName: 'Location', zohoName: 'Location', type: 'input', reductionField: false },
    { name: 'Operator Type', id: 'OperatorType', reductionName: 'OperatorType', type: 'dropdown', zohoName: 'Motor_Type', reductionField: false },
    { name: 'Motor/Crank Side', id: 'MotorCrankSide', reductionName: 'MotorCrankSide', type: 'dropdown', zohoName: 'Motor_Crank_Side', reductionField: false },
    { name: 'Crank Size', id: 'CrankSize', type: 'dropdown', reductionName: 'CrankSize', zohoName: 'Crank_Size', reductionField: false },
    { name: 'Custom Crank Size', id: 'CustomCrankSize', reductionName: 'CustomCrankSize', type: 'input', zohoName: 'customCrankSize', reductionField: true },
    { name: 'Plug Type', id: 'PlugType', type: 'dropdown', reductionName: 'PlugType', zohoName: 'Plug_Type', reductionField: false },
    { name: 'Switch / TX', id: 'SwitchTX', type: 'dropdown', reductionName: 'SwitchTX', zohoName: 'Switch_TX', reductionField: true },
    { name: 'Fabric Direction(OSLI)', id: 'FabricDirection', reductionName: 'FabricDirection', type: 'input', zohoName: 'Fabric_Direction', reductionField: true },
    { name: 'Hood', id: 'Hood', reductionName: 'Hood', type: 'checkbox', zohoName: 'Hood', reductionField: false },
    //task: reductionNote -> Note for both zohoName and reductionName
    { name: 'Reduction Notes', id: 'reductionNote', type: 'textarea', reductionName: 'ٔNote', zohoName: 'Note', reductionField: true },
    { name: 'Cover Sheet Note', id: 'CoverSheetNote', reductionName: 'CoverSheetNote', type: 'textarea', api_name: 'Reduction_Notes', zohoName: 'Reduction_Notes', reductionField: true, orderLevel: true },
    { name: 'Cover Sheet List', id: 'CoverSheetList', reductionName: 'CoverSheetList', type: 'multiselect', api_name: 'Awning_Coversheet_Picklist', zohoName: 'Awning_Coversheet_Picklist', reductionField: true, orderLevel: true },
    { name: 'Location Number', id: 'LocationNumber ', reductionName: 'LocationNumber', type: 'input', zohoName: 'Loc_No', reductionField: false },
    { name: 'Motor Size', id: 'MotorSize', reductionName: 'MotorSize', type: 'dropdown', zohoName: 'Motor_Size', reductionField: false },
    { name: 'Calculated Install Time', id: 'CalculatedInstallTime', reductionName: 'CalculatedInstallTime', type: 'input', zohoName: 'Install_Time', reductionField: true },
    { name: 'Grain', id: 'Grain', reductionName: 'Grain', type: 'dropdown', zohoName: 'Grain', reductionField: true },
    { name: 'Number Of Brackets', id: 'NumberOfBrackets', reductionName: 'NumberOfBrackets', type: 'decimalInput', zohoName: 'Number_of_Brackets', reductionField: false },
]
const zipperShadeFormFields = [
    {
        section: 'Size',
        fields: [
            { name: 'Width in Inches', id: 'WidthInInches', type: 'input', api_name: 'Shade_Width', class: 'requuiredField' },
            { name: 'Drop in Inches', id: 'DropInInches', type: 'input', api_name: 'Shade_Drop' },
        ]
    },
    {
        section: 'Fabric/Styles',
        fields: [
            { name: 'Frame Color', id: 'FrameColor', type: 'dropdown', api_name: 'PSW_Frame_Color' },
            { name: 'Fabric Color', id: 'FabricColor', type: 'dropdown', api_name: 'Shade_Curtain_Color' },
            { name: 'Fabric openness', id: 'ShadeOpenness', type: 'dropdown', api_name: 'Shade_Curtain_Openness', class: 'requuiredField' },
            { name: 'Shade Fabric Width', id: 'ShadeFabricWidth', type: 'dropdown', api_name: 'Shade Fabric Width', class: 'requuiredField' },
        ]
    },
    {
        section: 'Installation',
        fields: [
            { name: 'Mount Height', id: 'MountHeight', type: 'input', api_name: 'Mounting_Height' },
            { name: 'Mount Type', id: 'MountType', type: 'dropdown', api_name: 'Mounting_type' },
            { name: 'Mount Surface', id: 'MountSurface', type: 'dropdown', api_name: 'Mounting_Surface' },
            { name: 'Custom Bracket', id: 'CustomBracket', type: 'checkbox', api_name: 'Custom_bracket_for_LHP_to_manufacture', class: 'customBracketCheckBox' },
            { name: 'Override Install Time', id: 'OverrideInstallTime', type: 'decimalInput', api_name: '', min: '0', step: '1' },
            { name: 'Location', id: 'Location', type: 'input', api_name: 'Location' },
        ]
    },
    {
        section: 'Motor/Controller',
        fields: [
            { name: 'Operator Type', id: 'OperatorType', type: 'dropdown', api_name: 'Motor_Type', class: 'requuiredField' },
            { name: 'Motor/Crank Side', id: 'MotorCrankSide', type: 'dropdown', api_name: 'Motor_Crank_Side' },
            { name: 'Crank Size', id: 'CrankSize', type: 'dropdown', api_name: 'Crank_Size' },
            { name: 'Custom Crank Size', id: 'CustomCrankSize', type: 'input', api_name: 'customCrankSize' },
            { name: 'Plug Type', id: 'PlugType', type: 'dropdown', api_name: 'Plug_Type' },
            { name: 'Switch / TX', id: 'SwitchTX', type: 'dropdown', api_name: 'Switch-TX', addNone: true },
            { name: 'Fabric Direction(OSLI)', id: 'FabricDirection', type: 'dropdown', api_name: 'Fabric_Direction' },

        ]
    },
    {
        section: 'Addons',
        fields: [
            { name: 'Hood', id: 'Hood', type: 'checkbox', api_name: 'Hood', class: 'customBracketCheckBox' },
        ]
    },
    {
        section: 'Note',
        fields: [
            { name: '', id: 'reductionNote', type: 'textarea' },
        ]
    },
    {
        section: 'Coversheet',
        fields: [
            { name: '', id: 'CoverSheetNote ', type: 'textarea', api_name: 'Reduction_Notes' },
            { name: '', id: 'CoverSheetList', type: 'multiselect', api_name: 'Awning_Coversheet_Picklist' },
        ]
    },
    {
        section: 'Calculation',
        fields: [
            { name: 'Location Number', id: 'LocationNumber ', type: 'input', api_name: 'Loc_No' },
            { name: 'Motor Size', id: 'MotorSize', type: 'dropdown', api_name: 'Motor_Size' },
            { name: 'Calculated Install Time', id: 'CalculatedInstallTime', type: 'input', api_name: 'Install_Time' },
            { name: 'Grain', id: 'Grain', type: 'dropdown', api_name: 'Grain' },
            { name: 'Number Of Brackets', id: 'NumberOfBrackets', type: 'decimalInput', api_name: 'Number_of_Brackets', min: '0', step: '1' },
        ]
    },
]

const customDropdownOptions = [
    {
        api_name: 'Fabric_Direction',
        pick_list_values: [{ actual_value: 'None', display_value: '-None-' }, { actual_value: 'In', display_value: 'In' }, { actual_value: 'Out', display_value: 'Out' }]
    },
    {
        api_name: 'Grain',
        pick_list_values: [{ actual_value: 'None', display_value: '-None-' }, { actual_value: 'Vertical', display_value: 'Vertical' }, { actual_value: 'Horizontal', display_value: 'Horizontal' }]
    },
]

const FabricationInformationFields = [
    { showName: 'Number', name: 'Number' },
    { showName: 'Type', name: 'Type' },
    { showName: 'Width', name: 'Width' },
    { showName: 'Drop', name: 'Drop' },
    { showName: 'Frame Color', name: 'FrameColor' },
    { showName: 'Roller Tube', name: 'RollerTube' },
    { showName: 'Hem Bar', name: 'Hem Bar' },
    { showName: 'Weight Bar', name: 'Weight Bar' },
    { showName: 'Housing', name: 'Housing' },
    { showName: 'Side Track', name: 'SideTrack' },
    { showName: '# Of Brackets', name: 'Number_of_Brackets' },
    { showName: 'Operator', name: 'Operator' },
    { showName: 'Controls', name: 'ControlDescription' },
    { showName: 'Mount', name: 'Mount' },
    { showName: 'Crank', name: 'Crank' },
    { showName: 'Motor', name: 'Motor' },
    { showName: 'Switch/TX', name: 'Switch_TX' },
    { showName: 'Cord/Plug', name: 'PlugOptionText' },
]

const SewingInformationFields = [
    { showName: 'Total Yardage', name: 'Total Yardage', unit: 'Yards' },
    { showName: 'Material', name: 'Material' },
    { showName: 'Panels Cut Length', name: 'Panel Cut Length' },
    { showName: 'Final Fabric Width', name: 'Final Fabric Width' },
    { showName: 'Downsize Length', name: 'Downsize Length' },
    { showName: 'Final Fabric Length', name: 'Final Fabric Length' },
]

const MeasureTabelInfo = [
    { showName: 'Number', name: 'Number', fullRow: true },
    { showName: 'Total Width', name: 'Width', fullRow: true },
    { showName: 'Fabric Width', name: 'Final Fabric Width' },
    { showName: 'Drop', name: 'Drop' },
    { showName: 'Mount Height', name: 'MountHeight' },
    { showName: 'Material', name: 'Material' },
    { showName: 'Frame Color', name: 'FrameColor' },
    { showName: 'Fabric Dir.', name: 'Fabric_Direction' },
    { showName: 'Controlls', name: 'ControlDescription' },
]
const MeasureExtraFields = [
    { name: 'Cust.Brackets', zoho_name: 'CustomBrackets', type: 'checkbox' },
    { name: 'Plug', zoho_name: 'PlugOptionText', type: 'checkbox' },
    { name: 'Cord Length', zoho_name: 'PlugOptionText', type: 'input' }
]
const MeasureOtherInfoFields = [
    { name: '# of Brackets', zoho_name: 'Number_of_Brackets' },
    { name: 'Install Time', zoho_name: 'InstallTime' },
    { name: 'Yardage', zoho_name: 'Total Yardage' },
    { name: 'Measured By:', zoho_name: '', fullRow: true },
    { name: 'Pulled By:', zoho_name: '', fullRow: true },
]
const CalcRequiredFields = ["WidthInInches", "OperatorType", "ShadeOpenness", "ShadeFabricWidth"]


//PSW Fields
const PSWFields = [
    { name: 'Width in Inches', id: 'WidthInInches', reductionName: 'Width', zohoName: 'Shade_Width', type: 'input', reductionField: false },
    { name: 'Drop in Inches', id: 'DropInInches', reductionName: 'Drop', zohoName: 'Shade_Drop', type: 'input', reductionField: false },
    { name: 'Frame Color', id: 'FrameColor', reductionName: 'FrameColorText', zohoName: 'PSW_Frame_Color', type: 'dropdown', reductionField: false },
    { name: 'Fabric Color', id: 'FabricColor', reductionName: 'ShadeFabricColor', zohoName: 'Shade_Curtain_Color', type: 'dropdown', reductionField: false },
    { name: 'Fabric openness', id: 'ShadeOpenness', reductionName: 'ShadeOpenness', zohoName: 'Shade_Curtain_Openness', type: 'dropdown', reductionField: false },
    // { name: 'Shade Fabric Width', id: 'ShadeFabricWidth', reductionName: 'ShadeFabricWidth', zohoName: 'Shade_Width', type: 'dropdown', reductionField: true },
    { name: 'Shade Fabric Width', id: 'ShadeFabricWidth', reductionName: 'FabricWidth', zohoName: 'fabricWidth', api_name: 'fabricWidth', type: 'dropdown', reductionField: true },
    { name: 'Mount Height', id: 'MountHeight', reductionName: 'MountHeight', zohoName: 'Mounting_Height', type: 'input', reductionField: false },
    { name: 'Mount Type', id: 'MountType', reductionName: 'TypeText', zohoName: 'Mounting_type', type: 'dropdown', reductionField: false },
    { name: 'Mount Surface', id: 'MountSurface', reductionName: 'SurfaceText', zohoName: 'Mounting_Surface', type: 'dropdown', reductionField: false },
    { name: 'Custom Bracket', id: 'CustomBracket', reductionName: 'CustomBrackets', zohoName: 'Custom_bracket_for_LHP_to_manufacture', type: 'checkbox', reductionField: false },
    { name: 'Override Install Time', id: 'OverrideInstallTime', reductionName: 'OverrideInstallTime', zohoName: 'Override_Install_Time', type: 'decimalInput', reductionField: true },
    { name: 'Location', id: 'Location', reductionName: 'Location', zohoName: 'Location', type: 'input', reductionField: false },
    { name: 'Operator Type', id: 'OperatorType', reductionName: 'OperatorTypeId', type: 'dropdown', zohoName: 'Motor_Type', reductionField: false },
    { name: 'Motor/Crank Side', id: 'MotorCrankSide', reductionName: 'Side', type: 'dropdown', zohoName: 'Motor_Crank_Side', reductionField: false },
    { name: 'Crank Size', id: 'CrankSize', type: 'dropdown', reductionName: 'CrankText', zohoName: 'Crank_Size', reductionField: false },
    { name: 'Custom Crank Size', id: 'CustomCrankSize', reductionName: 'customcrank', type: 'input', zohoName: 'customCrankSize', reductionField: true },
    { name: 'Plug Type', id: 'PlugType', type: 'dropdown', reductionName: 'PlugOptionText', zohoName: 'Plug_Type', reductionField: false },
    { name: 'Switch / TX', id: 'SwitchTX', type: 'dropdown', reductionName: 'Switch_TX', zohoName: 'switch-TX', reductionField: true },
    { name: 'Track Guide', id: 'trackGuide', reductionName: 'TrackType', type: 'dropdown', zohoName: 'Track_Type', reductionField: false },
    { name: 'Hood', id: 'Hood', reductionName: 'Hood', type: 'checkbox', zohoName: 'PSW_Hood', reductionField: false },
    { name: 'Reduction Notes', id: 'reductionNote', type: 'textarea', reductionName: 'Note', zohoName: 'Note', reductionField: true },
    { name: 'Cover Sheet Note', id: 'CoverSheetNote', reductionName: 'CoverSheetNote', type: 'textarea', api_name: 'Reduction_Notes', zohoName: 'Reduction_Notes', reductionField: true, orderLevel: true },
    { name: 'Cover Sheet List', id: 'CoverSheetList', reductionName: 'Awning_Coversheet_Picklist', type: 'multiselect', api_name: 'Awning_Coversheet_Picklist', zohoName: 'Awning_Coversheet_Picklist', reductionField: true, orderLevel: true },
    { name: 'Location Number', id: 'LocationNumber ', reductionName: 'LocationNumber', type: 'input', zohoName: 'Loc_No', reductionField: false },
    { name: 'Motor Size', id: 'MotorSize', reductionName: 'MotorText', type: 'dropdown', zohoName: 'Motor_Size', reductionField: false },
    { name: 'Calculated Install Time', id: 'CalculatedInstallTime', reductionName: 'Install_Time', type: 'input', zohoName: 'Install_Time', reductionField: false },
    { name: 'QTY', id: 'QTY', reductionName: 'QTY', type: 'input', zohoName: 'QTY', reductionField: true },
    { name: 'Operator Side Width', id: 'OperatorSideWidth', reductionName: 'OperatorSideUnitWidth', type: 'input', zohoName: 'OperatorSideWidth', reductionField: true },
    { name: 'Grain', id: 'Grain', reductionName: 'Grain', type: 'dropdown', zohoName: 'Grain', reductionField: true },
]

//PSW Fields in show
const PSWFormFields = [
    {
        section: 'Size',
        fields: [
            { name: 'Width in Inches', id: 'WidthInInches', type: 'input', api_name: 'Shade_Width', class: 'requuiredField' },
            { name: 'Drop in Inches', id: 'DropInInches', type: 'input', api_name: 'Shade_Drop' },
        ]
    },
    {
        section: 'Fabric/Styles',
        fields: [
            { name: 'Frame Color', id: 'FrameColor', type: 'dropdown', api_name: 'PSW_Frame_Color' },
            { name: 'Fabric Color', id: 'FabricColor', type: 'dropdown', api_name: 'Shade_Curtain_Color' },
            { name: 'Fabric openness', id: 'ShadeOpenness', type: 'dropdown', api_name: 'Shade_Curtain_Openness', class: 'requuiredField' },
            { name: 'Shade Fabric Width', id: 'ShadeFabricWidth', type: 'dropdown', api_name: 'Shade Fabric Width', class: 'requuiredField' },
        ]
    },
    {
        section: 'Installation',
        fields: [
            { name: 'Mount Height', id: 'MountHeight', type: 'input', api_name: 'Mounting_Height' },
            { name: 'Mount Type', id: 'MountType', type: 'dropdown', api_name: 'Mounting_type' },
            { name: 'Mount Surface', id: 'MountSurface', type: 'dropdown', api_name: 'Mounting_Surface' },
            { name: 'Custom Bracket', id: 'CustomBracket', type: 'checkbox', api_name: 'Custom_bracket_for_LHP_to_manufacture', class: 'customBracketCheckBox' },
            { name: 'Override Install Time', id: 'OverrideInstallTime', type: 'decimalInput', api_name: '', min: '0', step: '1' },
            { name: 'Location', id: 'Location', type: 'input', api_name: 'Location' },
        ]
    },
    {
        section: 'Motor/Controller',
        fields: [
            { name: 'Operator Type', id: 'OperatorType', type: 'dropdown', api_name: 'Motor_Type', class: 'requuiredField' },
            { name: 'Motor/Crank Side', id: 'MotorCrankSide', type: 'dropdown', api_name: 'Motor_Crank_Side' },
            { name: 'Crank Size', id: 'CrankSize', type: 'dropdown', api_name: 'Crank_Size' },
            { name: 'Custom Crank Size', id: 'CustomCrankSize', type: 'input', api_name: 'customCrankSize' },
            { name: 'Plug Type', id: 'PlugType', type: 'dropdown', api_name: 'Plug_Type' },
            { name: 'Switch / TX', id: 'SwitchTX', type: 'dropdown', api_name: 'Switch-TX', addNone: true },
            { name: 'Track Guide', id: 'trackGuide', type: 'dropdown', api_name: 'Track_Type' },

        ]
    },
    {
        section: 'Addons',
        fields: [
            { name: 'Hood', id: 'Hood', type: 'checkbox', api_name: 'Hood', class: 'customBracketCheckBox' },
        ]
    },
    {
        section: 'Note',
        fields: [
            { name: '', id: 'reductionNote', type: 'textarea' },
        ]
    },
    {
        section: 'Coversheet',
        fields: [
            { name: '', id: 'CoverSheetNote ', type: 'textarea', api_name: 'Reduction_Notes' },
            { name: '', id: 'CoverSheetList', type: 'multiselect', api_name: 'Awning_Coversheet_Picklist' },
        ]
    },
    {
        section: 'Calculation',
        fields: [
            { name: 'Location Number', id: 'LocationNumber ', type: 'input', api_name: 'Loc_No' },
            { name: 'Motor Size', id: 'MotorSize', type: 'dropdown', api_name: 'Motor_Size' },
            { name: 'Calculated Install Time', id: 'CalculatedInstallTime', type: 'input', api_name: 'Install_Time' },
            { name: 'QTY', id: 'QTY', type: 'input', api_name: 'QTY' },
            { name: 'Operator Side Width', id: 'OperatorSideWidth', type: 'input', api_name: 'OperatorSideWidth' },
            { name: 'Grain', id: 'Grain', type: 'dropdown', api_name: 'Grain' },
        ]
    },
]

const PSWFabricationInformationFields = [
    { showName: 'Number', name: 'Number' },
    { showName: 'Type', name: 'Type' },
    { showName: 'Width', name: 'Width' },
    { showName: 'Drop', name: 'Drop' },
    { showName: 'Frame Color', name: 'FrameColor' },
    { showName: 'Roller Tube', name: 'RollerTube' },
    { showName: 'Bottom Pipe', name: 'Bottom Pipe' },
    { showName: 'Track Type', name: 'TrackType' },
    { showName: 'Operator', name: 'Operator' },
    { showName: 'Controls', name: 'ControlDescription' },
    { showName: 'Mount', name: 'MountingType', secondName: 'MountingMaterial' },
    { showName: 'Hood', name: 'Hood' },
    { showName: 'Crank', name: 'Crank' },
    { showName: 'Motor', name: 'Motor' },
    { showName: 'Switch/TX', name: 'Switch_TX' },
    { showName: 'Cord/Plug', name: 'PlugOptionText' },
]

const PSWSewingInformationFields = [
    { showName: 'Total Yardage', name: 'Total Yardage', unit: 'Yards' },
    { showName: 'Material', name: 'Material' },
    { showName: 'Panels Cut Length', name: 'Panel Cut Length' },
    { showName: 'Final Fabric Width', name: 'Final Fabric Width' },
    { showName: 'Downsize Length', name: 'Downsize Length' },
    { showName: 'Final Fabric Length', name: 'Final Fabric Length' },
]

const PSWMeasureTabelInfo = [
    { showName: 'Number', name: 'Number', fullRow: true },
    { showName: 'Type', name: 'Type', fullRow: true },
    { showName: 'Total Width', name: 'Width' },
    { showName: 'Fabric Width', name: 'Final Fabric Width' },
    { showName: 'Drop', name: 'Drop' },
    { showName: 'Mount Height', name: 'MountHeight' },
    { showName: 'Material', name: 'Material' },
    { showName: 'Frame Color', name: 'FrameColor' },
    { showName: 'Operator', name: 'Operator' },
    { showName: 'Controlls', name: 'ControlDescription' },
    { showName: 'Track Type', name: 'TrackType' },
]

const PSWMeasureExtraFields = [
    { name: 'Hood', zoho_name: 'Hood', type: 'checkbox' },
    { name: 'Cust.Brackets', zoho_name: 'CustomBrackets', type: 'checkbox' },
    { name: 'Plug', zoho_name: 'PlugOptionText', type: 'checkbox' },
    { name: 'Cord Length', zoho_name: 'PlugOptionText', type: 'input' }
]
const PSWMeasureOtherInfoFields = [
    { name: 'Install Time', zoho_name: 'InstallTime' },
    { name: 'Yardage', zoho_name: 'Total Yardage' },
    { name: 'Measured By:', zoho_name: '', fullRow: true },
    { name: 'Pulled By:', zoho_name: '', fullRow: true },
]

//PSW Fields in show
const SolarShadeFormFields = [
    {
        section: 'Size',
        fields: [
            { name: 'Width in Inches', id: 'WidthInInches', type: 'input', api_name: 'Shade_Width', class: 'requuiredField' },
            { name: 'Drop in Inches', id: 'DropInInches', type: 'input', api_name: 'Shade_Drop' },
        ]
    },
    {
        section: 'Fabric/Styles',
        fields: [
            { name: 'Frame Color', id: 'FrameColor', type: 'dropdown', api_name: 'PSW_Frame_Color' },
            { name: 'Fabric Color', id: 'FabricColor', type: 'dropdown', api_name: 'Shade_Curtain_Color' },
            { name: 'Shade openness', id: 'ShadeOpenness', type: 'dropdown', api_name: 'Shade_Curtain_Openness', class: 'requuiredField' },
            { name: 'Shade Fabric Width', id: 'ShadeFabricWidth', type: 'dropdown', api_name: 'Shade Fabric Width', class: 'requuiredField' },
        ]
    },
    {
        section: 'Installation',
        fields: [
            { name: 'Mount Height', id: 'MountHeight', type: 'input', api_name: 'Mounting_Height' },
            { name: 'Mount Type', id: 'MountType', type: 'dropdown', api_name: 'Mounting_type' },
            { name: 'Mount Surface', id: 'MountSurface', type: 'dropdown', api_name: 'Mounting_Surface' },
            { name: 'Custom Bracket', id: 'CustomBracket', type: 'checkbox', api_name: 'Custom_bracket_for_LHP_to_manufacture', class: 'customBracketCheckBox' },
            { name: 'Override Install Time', id: 'OverrideInstallTime', type: 'decimalInput', api_name: '', min: '0', step: '1' },
            { name: 'Location', id: 'Location', type: 'input', api_name: 'Location' },
        ]
    },
    {
        section: 'Motor/Controller',
        fields: [
            { name: 'Operator Type', id: 'OperatorType', type: 'dropdown', api_name: 'Motor_Type', class: 'requuiredField' },
            { name: 'Motor/Crank Side', id: 'MotorCrankSide', type: 'dropdown', api_name: 'Motor_Crank_Side' },
            { name: 'Crank Size', id: 'CrankSize', type: 'dropdown', api_name: 'Crank_Size' },
            { name: 'Custom Crank Size', id: 'CustomCrankSize', type: 'input', api_name: 'customCrankSize' },
            { name: 'Plug Type', id: 'PlugType', type: 'dropdown', api_name: 'Plug_Type' },
            { name: 'Switch / TX', id: 'SwitchTX', type: 'dropdown', api_name: 'Switch-TX', addNone: true },
            { name: 'Track Guide', id: 'trackGuide', type: 'dropdown', api_name: 'Track_Type' },

        ]
    },
    {
        section: 'Addons',
        fields: [
            { name: 'Hood', id: 'Hood', type: 'checkbox', api_name: 'Hood', class: 'customBracketCheckBox' },
        ]
    },
    {
        section: 'Note',
        fields: [
            { name: '', id: 'reductionNote', type: 'textarea' },
        ]
    },
    {
        section: 'Coversheet',
        fields: [
            { name: '', id: 'CoverSheetNote ', type: 'textarea', api_name: 'Reduction_Notes' },
            { name: '', id: 'CoverSheetList', type: 'multiselect', api_name: 'Awning_Coversheet_Picklist' },
        ]
    },
    {
        section: 'Calculation',
        fields: [
            { name: 'Location Number', id: 'LocationNumber ', type: 'input', api_name: 'Loc_No' },
            { name: 'Motor Size', id: 'MotorSize', type: 'dropdown', api_name: 'Motor_Size' },
            { name: 'Calculated Install Time', id: 'CalculatedInstallTime', type: 'input', api_name: 'Install_Time' },
            { name: 'QTY', id: 'QTY', type: 'input', api_name: 'QTY' },
            { name: 'Operator Side Width', id: 'OperatorSideWidth', type: 'input', api_name: 'OperatorSideWidth' },
            { name: 'Grain', id: 'Grain', type: 'dropdown', api_name: 'Grain' },
        ]
    },
]


//SolarShade Fields
const SolarShadeFields = [
    { name: 'Width in Inches', id: 'WidthInInches', reductionName: 'Width', zohoName: 'Shade_Width', type: 'input', reductionField: false },
    { name: 'Drop in Inches', id: 'DropInInches', reductionName: 'Drop', zohoName: 'Shade_Drop', type: 'input', reductionField: false },
    { name: 'Frame Color', id: 'FrameColor', reductionName: 'FrameColorText', zohoName: 'PSW_Frame_Color', type: 'dropdown', reductionField: false },
    { name: 'Fabric Color', id: 'FabricColor', reductionName: 'ShadeFabricColor', zohoName: 'Shade_Curtain_Color', type: 'dropdown', reductionField: false },
    { name: 'Fabric openness', id: 'ShadeOpenness', reductionName: 'ShadeOpenness', zohoName: 'Shade_Curtain_Openness', type: 'dropdown', reductionField: false },
    // { name: 'Shade Fabric Width', id: 'ShadeFabricWidth', reductionName: 'ShadeFabricWidth', zohoName: 'Shade_Width', type: 'dropdown', reductionField: true },
    { name: 'Shade Fabric Width', id: 'ShadeFabricWidth', reductionName: 'FabricWidth', zohoName: 'fabricWidth', api_name: 'fabricWidth', type: 'dropdown', reductionField: true },
    { name: 'Mount Height', id: 'MountHeight', reductionName: 'MountHeight', zohoName: 'Mounting_Height', type: 'input', reductionField: false },
    { name: 'Mount Type', id: 'MountType', reductionName: 'TypeText', zohoName: 'Mounting_type', type: 'dropdown', reductionField: false },
    { name: 'Mount Surface', id: 'MountSurface', reductionName: 'SurfaceText', zohoName: 'Mounting_Surface', type: 'dropdown', reductionField: false },
    { name: 'Custom Bracket', id: 'CustomBracket', reductionName: 'CustomBrackets', zohoName: 'Custom_bracket_for_LHP_to_manufacture', type: 'checkbox', reductionField: false },
    { name: 'Override Install Time', id: 'OverrideInstallTime', reductionName: 'OverrideInstallTime', zohoName: 'Override_Install_Time', type: 'decimalInput', reductionField: true },
    { name: 'Location', id: 'Location', reductionName: 'Location', zohoName: 'Location', type: 'input', reductionField: false },
    { name: 'Operator Type', id: 'OperatorType', reductionName: 'OperatorTypeId', type: 'dropdown', zohoName: 'Motor_Type', reductionField: false },
    { name: 'Motor/Crank Side', id: 'MotorCrankSide', reductionName: 'Side', type: 'dropdown', zohoName: 'Motor_Crank_Side', reductionField: false },
    { name: 'Crank Size', id: 'CrankSize', type: 'dropdown', reductionName: 'CrankText', zohoName: 'Crank_Size', reductionField: false },
    { name: 'Custom Crank Size', id: 'CustomCrankSize', reductionName: 'customcrank', type: 'input', zohoName: 'customCrankSize', reductionField: true },
    { name: 'Plug Type', id: 'PlugType', type: 'dropdown', reductionName: 'PlugOptionText', zohoName: 'Plug_Type', reductionField: false },
    { name: 'Switch / TX', id: 'SwitchTX', type: 'dropdown', reductionName: 'Switch_TX', zohoName: 'switch-TX', reductionField: true },
    { name: 'Track Guide', id: 'trackGuide', reductionName: 'TrackType', type: 'dropdown', zohoName: 'Track_Type', reductionField: false },
    { name: 'Hood', id: 'Hood', reductionName: 'Hood', type: 'checkbox', zohoName: 'PSW_Hood', reductionField: false },
    { name: 'Reduction Notes', id: 'reductionNote', type: 'textarea', reductionName: 'Note', zohoName: 'Note', reductionField: true },
    { name: 'Cover Sheet Note', id: 'CoverSheetNote', reductionName: 'CoverSheetNote', type: 'textarea', api_name: 'Reduction_Notes', zohoName: 'Reduction_Notes', reductionField: true, orderLevel: true },
    { name: 'Cover Sheet List', id: 'CoverSheetList', reductionName: 'Awning_Coversheet_Picklist', type: 'multiselect', api_name: 'Awning_Coversheet_Picklist', zohoName: 'Awning_Coversheet_Picklist', reductionField: true, orderLevel: true },
    { name: 'Location Number', id: 'LocationNumber ', reductionName: 'LocationNumber', type: 'input', zohoName: 'Loc_No', reductionField: false },
    { name: 'Motor Size', id: 'MotorSize', reductionName: 'MotorText', type: 'dropdown', zohoName: 'Motor_Size', reductionField: false },
    { name: 'Calculated Install Time', id: 'CalculatedInstallTime', reductionName: 'Install_Time', type: 'input', zohoName: 'Install_Time', reductionField: false },
    { name: 'QTY', id: 'QTY', reductionName: 'QTY', type: 'input', zohoName: 'QTY', reductionField: true },
    { name: 'Operator Side Width', id: 'OperatorSideWidth', reductionName: 'OperatorSideUnitWidth', type: 'input', zohoName: 'OperatorSideUnitWidth', reductionField: true },
    { name: 'Grain', id: 'Grain', reductionName: 'Grain', type: 'dropdown', zohoName: 'Grain', reductionField: true },
]

const SolarShadeFabricationInformationFields = [
    { showName: 'Number', name: 'Number' },
    { showName: 'Type', name: 'Type' },
    { showName: 'Width', name: 'Width' },
    { showName: 'Drop', name: 'Drop' },
    { showName: 'Frame Color', name: 'FrameColor' },
    { showName: 'Roller Tube', name: 'RollerTube' },
    { showName: 'Hem Bar', name: 'HemBar' },
    { showName: 'Filler Rod', name: 'FillerRod' },
    { showName: 'Hood', name: 'Hood' },
    { showName: 'Side Track', name: 'SideTrack' },
    { showName: 'Side Tube', name: 'SideTube' },
    { showName: 'Operator', name: 'Operator' },
    { showName: 'Controls', name: 'ControlDescription' },
    { showName: 'Mount', name: 'MountingType', secondName: 'MountingMaterial' },
    { showName: 'Crank', name: 'Crank' },
    { showName: 'Motor', name: 'Motor' },
    { showName: 'Switch/TX', name: 'Switch_TX' },
    { showName: 'Cord/Plug', name: 'PlugOptionText' },
]

const SolarShadeSewingInformationFields = [
    { showName: 'Total Yardage', name: 'Total Yardage', unit: 'Yards' },
    { showName: 'Material', name: 'Material' },
    { showName: 'Panels Cut Length', name: 'Panel Cut Length' },
    { showName: 'Final Fabric Width', name: 'Final Fabric Width' },
    { showName: 'Downsize Length', name: 'Downsize Length' },
    { showName: 'Final Fabric Length', name: 'Final Fabric Length' },
]

const SolarShadeMeasureTabelInfo = [
    { showName: 'Number', name: 'Number', fullRow: true },
    { showName: 'Total Width', name: 'Width', fullRow: true },
    { showName: 'Fabric Width', name: 'Final Fabric Width' },
    { showName: 'Drop', name: 'Drop' },
    { showName: 'Mount Height', name: 'MountHeight' },
    { showName: 'Material', name: 'Material' },
    { showName: 'Frame Color', name: 'FrameColor' },
    { showName: 'Operator', name: 'Operator' },
    { showName: 'Controlls', name: 'ControlDescription' },
    { showName: 'Track Type', name: 'TrackType' },
]
const SolarShadeMeasureExtraFields = [
    { name: 'Hood', zoho_name: 'Hood', type: 'checkbox' },
    { name: 'Cust.Brackets', zoho_name: 'CustomBrackets', type: 'checkbox' },
    { name: 'Plug', zoho_name: 'PlugOptionText', type: 'checkbox' },
    { name: 'Cord Length', zoho_name: 'PlugOptionText', type: 'input' }
]
const SolarShadeMeasureOtherInfoFields = [
    { name: 'Install Time', zoho_name: 'InstallTime' },
    { name: 'Yardage', zoho_name: 'Total Yardage' },
    { name: 'Measured By:', zoho_name: '', fullRow: true },
    { name: 'Pulled By:', zoho_name: '', fullRow: true },
]

//awning fields*********************************************************************

//PSW Fields in show
const AwningReductionFormFields = [
    {
        section: 'Size',
        fields: [
            { name: 'Width in', id: 'WidthIn', type: 'input', api_name: 'Awning_Width' },
            { name: 'Projection', id: 'Projection', type: 'dropdown', api_name: 'Projection' },
            { name: 'Cloth Size', id: 'ClothSize', type: 'dropdown', api_name: 'Cloth Size' },
            { name: 'Cloth Actual Size', id: 'ClothActualSize', type: 'input', api_name: 'cloth_Actual_Size' },
            { name: 'Wind Leg', id: 'WindLeg', type: 'decimalInput', api_name: 'Shade_Drop' },
            { name: 'Strip Offset', id: 'StripOffset', type: 'input', api_name: 'Strip_Offset' },
        ]
    },
    {
        section: 'Fabric/Styles',
        fields: [
            { name: 'Fabric Type', id: 'FabricType', type: 'dropdown', api_name: 'Fabric_Type' },
            { name: 'Fabric Selection', id: 'FabricSelection', type: 'input', api_name: 'Fabric_Selection', },
            { name: 'Binding Color', id: 'BindingColor', type: 'dropdown', api_name: 'Binding_Color' },
            { name: 'Valance Style', id: 'ValanceStyle', type: 'dropdown', api_name: 'Valance_Style' },
            { name: 'Frame Color', id: 'FrameColor', type: 'dropdown', api_name: 'Frame_Color' },
        ]
    },
    {
        section: 'Installation',
        fields: [
            { name: 'Mount Height', id: 'MountHeight', type: 'input', api_name: 'Mounting_Height' },
            { name: 'Mount Type', id: 'MountType', type: 'dropdown', api_name: 'Mounting_type' },
            { name: 'Mount Surface', id: 'MountSurface', type: 'dropdown', api_name: 'Mounting_Surface' },
            { name: 'Bottom of Val', id: 'BottomOfVal', type: 'decimalInput', api_name: 'Bottom_of_val', min: '0', step: '1' },
            { name: 'Override Install Time', id: 'OverrideInstallTime', type: 'decimalInput', api_name: 'Override_Install_Time', min: '0', step: '1' },
            { name: 'Location', id: 'Location', type: 'input', api_name: 'Location' },
            { name: 'Custom Bracket', id: 'CustomBracket', type: 'checkbox', api_name: 'Custom_bracket_for_LHP_to_manufacture', class: 'customBracketCheckBox' },
        ]
    },
    {
        section: 'Motor/Controller',
        fields: [
            { name: 'Operator Type', id: 'OperatorType', type: 'dropdown', api_name: 'Motor_Type' },
            { name: 'Motor/Crank Side', id: 'MotorCrankSide', type: 'dropdown', api_name: 'Motor_Crank_Side' },
            { name: 'Crank Size', id: 'CrankSize', type: 'dropdown', api_name: 'Crank_Size' },
            { name: 'Custom Crank Size', id: 'CustomCrankSize', type: 'input', api_name: 'customCrankSize' },
            { name: 'Plug Type', id: 'PlugType', type: 'dropdown', api_name: 'Plug_Type' },
            { name: 'Switch / TX', id: 'SwitchTX', type: 'dropdown', api_name: 'Switch-TX', addNone: true },
            { name: 'Motion Sensor', id: 'MotionSensor', type: 'checkbox', api_name: 'Motion_Sensor', class: 'customBracketCheckBox' },
        ]
    },
    {
        section: 'Addons',
        fields: [
            { name: 'Front Curtain', id: 'FrontCurtain', type: 'dropdown', api_name: 'Front_Curtain' },
            { name: 'Front Curtain Color', id: 'FrontCurtainColor', type: 'dropdown', api_name: 'Front_Curtain_Color' },
            { name: 'Front Curtain Openness', id: 'FrontCurtainOpenness', type: 'dropdown', api_name: 'Front_Curtain_Openness' },
            { name: 'Front Curtain Drop Size', id: 'FrontCurtainDropSize', type: 'dropdown', api_name: 'Front_Curtain_Drop_Size' },
            { name: 'Hood', id: 'Hood', type: 'checkbox', api_name: 'Hood', class: 'customBracketCheckBox' },
            { name: 'Back Board', id: 'BackBoard', type: 'checkbox', api_name: 'Back_Board', class: 'customBracketCheckBox' },
            { name: 'Winter Cover', id: 'WinterCover', type: 'checkbox', api_name: 'Winter_Cover', class: 'customBracketCheckBox' },
        ]
    },
    {
        section: 'Note',
        fields: [
            { name: '', id: 'reductionNote', type: 'textarea' },
        ]
    },
    {
        section: 'Coversheet',
        fields: [
            { name: '', id: 'CoverSheetNote ', type: 'textarea', api_name: 'Reduction_Notes' },
            { name: '', id: 'CoverSheetList', type: 'multiselect', api_name: 'Awning_Coversheet_Picklist' },
        ]
    },
    {
        section: 'Calculation',
        fields: [
            { name: 'Location Number', id: 'LocationNumber ', type: 'input', api_name: 'Loc_No' },
            { name: 'Val Size', id: 'ValSize', type: 'input', api_name: 'ValSize' },
            { name: 'Number Of Brackets', id: 'NumberOfBrackets', type: 'decimalInput', api_name: 'Number_of_Brackets', min: '0', step: '1' },
            { name: 'Motor Size', id: 'MotorSize', type: 'dropdown', api_name: 'Motor_Size' },
            { name: 'Calculated Install Time', id: 'CalculatedInstallTime', type: 'input', api_name: 'Install_Time' },
            { name: 'Cross Arm', id: 'CrossArm', type: 'checkbox', api_name: 'Cross_Arm', class: 'customBracketCheckBox' },

        ]
    },
]
//Awning required fields for calc
const AwningCalcRequiredFields = ["WidthIn", "Projection", "OperatorType"]

//fields of Awning form used for geting and setting values to zoho and reduce function 
const AwningFields = [
    { name: 'Width in', id: 'WidthIn', reductionName: 'Width', zohoName: 'Awning_Width', type: 'input', reductionField: false, customFuncName: 'Width' },
    { name: 'Projection', id: 'Projection', reductionName: 'Projection', zohoName: 'Projection', type: 'dropdown', reductionField: false, customFuncName: 'ProjectionText' },
    { name: 'Drop in Inches', id: 'DropInInches', reductionName: 'Drop', zohoName: 'Drop', type: 'input', reductionField: true, customFuncName: '' },
    { name: 'Cloth Size', id: 'ClothSize', api_name: 'Cloth Size', reductionName: 'cloth_Size', zohoName: 'cloth_Size', type: 'dropdown', reductionField: true, customFuncName: 'defaultClothWidth' },
    { name: 'Cloth Actual Size', id: 'ClothActualSize', reductionName: 'cloth_Actual_Size', zohoName: 'cloth_Actual_Size', type: 'input', reductionField: true, customFuncName: 'ActualClothWidth' },
    { name: 'Wind Leg', id: 'WindLeg', reductionName: 'Wind_Leg', zohoName: 'Wind_Leg', type: 'decimalInput', reductionField: true, customFuncName: 'WindLegText' },
    { name: 'Strip Offset', id: 'StripOffset', reductionName: 'Strip_Offset', zohoName: 'Strip_Offset', type: 'input', reductionField: true, customFuncName: 'StripOffset' },
    { name: 'Fabric Type', id: 'FabricType', api_name: 'Fabric_Type', reductionName: 'Fabric_Type', zohoName: 'Fabric_Type', type: 'dropdown', reductionField: false, customFuncName: 'Fabric Type' },
    { name: 'Fabric Selection', id: 'FabricSelection', api_name: 'Fabric_Selection', reductionName: 'Fabric_Selection', zohoName: 'Fabric_Selection', type: 'input', reductionField: false, customFuncName: 'Fabric Selection' },
    { name: 'Binding Color', id: 'BindingColor', api_name: 'Binding_Color', reductionName: 'Binding_Color', zohoName: 'Binding_Color', type: 'dropdown', reductionField: false, customFuncName: 'Binding' },
    { name: 'Valance Style', id: 'ValanceStyle', api_name: 'Valance_Style', reductionName: 'Valance_Style', zohoName: 'Valance_Style', type: 'dropdown', reductionField: false, customFuncName: 'Valance' },
    { name: 'Frame Color', id: 'FrameColor', api_name: 'Frame_Color', reductionName: 'Frame_Color', zohoName: 'Frame_Color', type: 'dropdown', reductionField: false, customFuncName: 'FrameColorText' },
    { name: 'Mount Height', id: 'MountHeight', reductionName: 'MountHeight', zohoName: 'Mounting_Height', type: 'decimalInput', reductionField: false, customFuncName: 'MountHeight' },
    { name: 'Mount Type', id: 'MountType', reductionName: 'Mounting_type', zohoName: 'Mounting_type', type: 'dropdown', reductionField: false, customFuncName: 'TypeText' },
    { name: 'Mount Surface', id: 'MountSurface', reductionName: 'SurfaceText', zohoName: 'Mounting_Surface', type: 'dropdown', reductionField: false, customFuncName: 'SurfaceText' },
    { name: 'Custom Bracket', id: 'CustomBracket', reductionName: 'CustomBrackets', zohoName: 'Custom_bracket_for_LHP_to_manufacture', type: 'checkbox', reductionField: false, customFuncName: 'CustomBrackets' },
    { name: 'Override Install Time', id: 'OverrideInstallTime', reductionName: 'Override_Install_Time', zohoName: 'Override_Install_Time', type: 'decimalInput', reductionField: true, customFuncName: 'OverrideInstallTime' },
    { name: 'Bottom of Val', id: 'BottomOfVal', reductionName: 'Bottom_of_val', zohoName: 'Bottom_of_val', type: 'decimalInput', reductionField: true, customFuncName: 'BottomOfVal' },
    { name: 'Location', id: 'Location', reductionName: 'Location', zohoName: 'Location', type: 'input', reductionField: false, customFuncName: 'Location' },
    { name: 'Operator Type', id: 'OperatorType', reductionName: 'OperatorTypeId', type: 'dropdown', zohoName: 'Motor_Type', reductionField: false, customFuncName: 'OperatorTypeId' },
    { name: 'Motor/Crank Side', id: 'MotorCrankSide', reductionName: 'Side', type: 'dropdown', zohoName: 'Motor_Crank_Side', reductionField: false, customFuncName: 'Side' },
    { name: 'Crank Size', id: 'CrankSize', type: 'dropdown', reductionName: 'CrankText', zohoName: 'Crank_Size', reductionField: false, customFuncName: 'CrankText' },
    { name: 'Custom Crank Size', id: 'CustomCrankSize', reductionName: 'customCrankSize', type: 'input', zohoName: 'customCrankSize', reductionField: true, customFuncName: 'customcrank' },
    { name: 'Plug Type', id: 'PlugType', type: 'dropdown', reductionName: 'PlugOptionText', zohoName: 'Plug_Type', reductionField: false, customFuncName: 'PlugOptionText' },
    { name: 'Switch / TX', id: 'SwitchTX', type: 'dropdown', reductionName: 'switch-TX', zohoName: 'switch-TX', reductionField: true, customFuncName: 'Switch_TX' },
    { name: 'Motion Sensor', id: 'MotionSensor', reductionName: 'Motion_Sensor', type: 'checkbox', zohoName: 'Motion_Sensor', reductionField: false, customFuncName: 'MotionSensor' },
    { name: 'Front Curtain', id: 'FrontCurtain', type: 'dropdown', reductionName: 'Front_Curtain', zohoName: 'Front_Curtain', reductionField: false, customFuncName: 'FrontCurtainType' },
    { name: 'Front Curtain Color', id: 'FrontCurtainColor', type: 'dropdown', reductionName: 'Front_Curtain_Color', zohoName: 'Front_Curtain_Color', reductionField: false, customFuncName: 'FrontCurtainColor' },
    { name: 'Front Curtain Openness', id: 'FrontCurtainOpenness', type: 'dropdown', reductionName: 'Front_Curtain_Openness', zohoName: 'Front_Curtain_Openness', reductionField: false, customFuncName: 'FrontCurtainOpenness' },
    { name: 'Front Curtain DropSize', id: 'FrontCurtainDropSize', type: 'dropdown', reductionName: 'Front_Curtain_Drop_Size', zohoName: 'Front_Curtain_Drop_Size', reductionField: false, customFuncName: 'FrontCurtainDropSize' },
    { name: 'Hood', id: 'Hood', reductionName: 'Hood', type: 'checkbox', zohoName: 'Hood', reductionField: false, customFuncName: 'Hood' },
    { name: 'Back Board', id: 'BackBoard', reductionName: 'Back_Board', type: 'checkbox', zohoName: 'Back_Board', reductionField: false, customFuncName: 'Backboard' },
    { name: 'Winter Cover', id: 'WinterCover', reductionName: 'Winter_Cover', type: 'checkbox', zohoName: 'Winter_Cover', reductionField: false, customFuncName: 'WinterCover' },
    { name: 'Reduction Notes', id: 'reductionNote', type: 'textarea', reductionName: 'Note', zohoName: 'Note', reductionField: true, customFuncName: 'Notes' },
    { name: 'Cover Sheet Note', id: 'CoverSheetNote', reductionName: 'CoverSheetNote', type: 'textarea', api_name: 'Reduction_Notes', zohoName: 'Reduction_Notes', reductionField: true, orderLevel: true, customFuncName: '' },
    { name: 'Cover Sheet List', id: 'CoverSheetList', reductionName: 'Awning_Coversheet_Picklist', type: 'multiselect', api_name: 'Awning_Coversheet_Picklist', zohoName: 'Awning_Coversheet_Picklist', reductionField: true, orderLevel: true, customFuncName: 'Awning_Coversheet_Picklist' },
    { name: 'Location Number', id: 'LocationNumber ', reductionName: 'LocationNumber', type: 'input', zohoName: 'Loc_No', reductionField: false, customFuncName: '' },
    { name: 'Val Size', id: 'ValSize', reductionName: 'Val_Size', type: 'input', zohoName: 'Val_Size', reductionField: true, customFuncName: 'ValSize' },
    { name: 'Number Of Brackets', id: 'NumberOfBrackets', reductionName: 'Number_of_Brackets', type: 'input', zohoName: 'Number_of_Brackets', reductionField: false, customFuncName: 'QtyOfBrackets' },
    { name: 'Motor Size', id: 'MotorSize', reductionName: 'MotorText', type: 'dropdown', zohoName: 'Motor_Size', reductionField: false, customFuncName: 'MotorText' },
    { name: 'Calculated Install Time', id: 'CalculatedInstallTime', reductionName: 'Install_Time', type: 'input', zohoName: 'Install_Time', reductionField: false, customFuncName: '' },
    { name: 'Cross Arm', id: 'CrossArm', reductionName: 'Cross_Arm', type: 'checkbox', zohoName: 'Cross_Arm', reductionField: false, customFuncName: 'Xla' },
]

//Awning reduction and measure fields
const AwningFabricationInformationFields = [
    { showName: 'Number', name: 'Number' },
    { showName: 'Type', name: 'Type' },
    { showName: 'Width', name: 'Widthc' },
    { showName: 'Projection', name: 'Projectionc' },
    { showName: 'Frame', name: 'FrameColor' },
    { showName: 'Operator', name: 'Operatorc' },
    { showName: 'Motor', name: 'Motor' },
    { showName: 'Switch/TX', name: 'Switch_TX' },
    { showName: 'Controls', name: 'Controls' },
    { showName: 'Cord/Plug', name: 'Cord_Plug' },
    { showName: 'Back Bar', name: 'BackBarc' },
    { showName: 'Front Bar', name: 'FrontBarc' },
    { showName: 'Roller Tube', name: 'RollerTube' },
    { showName: 'Housing', name: 'Housing' },
    { showName: 'Attach', name: 'Attachc', singleLine: true },
    { showName: 'Center Support', name: 'CenterSupport' },
    { showName: 'Hood', name: 'Hood' },
    { showName: 'Wind Legs', name: 'WindLegs' },
    { showName: 'Curtain', name: 'FrontCurtain' },
    { showName: 'Crank', name: 'Crank' },
    { showName: 'CustomeBracket', name: 'CustomBrackets', singleLine: true },
    { showName: 'Other', name: 'Otherc', singleLine: true }
]

const AwningSewingInformationFields = [
    { showName: 'Yards', name: 'TotalYardage', unit: 'Yards' },
    { showName: 'Fabric', name: 'Material' },
    { showName: 'Valance', name: 'Valancec' },
    { showName: 'Binding', name: 'Binding' },
    { showName: 'Panels Cut Length', name: 'PanelsCutLengthc' },
    { showName: 'Finished Width', name: 'FinishedWidth' },
    { showName: 'Cloth Width', name: 'ActualClothWidth' },
    { showName: 'Stripe Offset', name: 'StripOffset' },
    { showName: 'Hot Knife', name: 'HotKnife' },
    { showName: 'Curtain', name: 'FrontCurtain' },

]
const AwningInstallationInformationFields = [
    { showName: 'Install Time', name: 'InstallTimec' },
    { showName: '# Brackets', name: 'QtyOfBrackets' },
    { showName: 'Mount Height', name: 'MountHeight' },
    { showName: 'Valance Height', name: 'ValanceHeight' },
    { showName: 'Mount Surface', name: 'MountSurface' },
    { showName: 'Mount Location', name: 'MountLocation' },
]
const AwningoOtherInfo = [
    ['1/16- .062', '9/16- .562'],
    ['1/8- .125', '5/8- .625'],
    ['3/16- .187', '11/16- .687'],
    ['1/4- .250', '3/4- .750'],
    ['5/16- .312', '13/16- .812'],
    ['3/8- .375', '7/8/16- .875'],
    ['7/16- .437', '15/16- .937'],
    ['1/2- .500', '']
]

const AwningMeasureTabelInfo = [
    { showName: 'Number', name: 'Number', fullRow: true },
    { showName: 'Type', name: 'Type', fullRow: true },
    { showName: 'Total Width', name: 'Widthc' },
    { showName: 'Fabric Width', name: 'FabricWidth' },
    { showName: 'Projection', name: 'Projection' },
    { showName: 'Mount Height', name: 'MountHeight' },
    { showName: 'Val. Bottom', name: 'ValBottom' },
    { showName: 'Valance', name: 'Valance' },
    { showName: 'Oprator', name: 'Operatorc' },
    { showName: 'Binding', name: 'Binding' },
    { showName: 'Material', name: 'Material' },
    { showName: 'Frame', name: 'Frame' },
    { showName: 'Motor', name: 'Motor' },
    { showName: 'Switch/TX', name: 'Switch_TX' },
    { showName: 'Plug', name: 'Plug' },
    { showName: 'Wind Legs', name: 'WindLegs' },
    { showName: 'Curtain', name: 'FrontCurtain' },
]
const AwningMeasureExtraFields = [
    { name: 'Cust.Brackets', zoho_name: 'CustomBrackets', type: 'checkbox' },
    { name: 'BackBoard', zoho_name: 'Backboard', type: 'checkbox' },
    { name: 'Winter Cover', zoho_name: 'WinterCover', type: 'checkbox' },
    { name: 'XLA', zoho_name: 'IsCrossArms', type: 'checkbox' },
    { name: 'Hood', zoho_name: 'Hood', type: 'checkbox' }

]
const AwningMeasureOtherInfoFields = [
    { name: '# of Brackets', zoho_name: 'QtyOfBrackets' },
    { name: 'Install Time', zoho_name: 'InstallTimec' },
    { name: 'Yardage', zoho_name: 'TotalYardage' },
    { name: 'Measured By:', zoho_name: '', fullRow: true },
    { name: 'Pulled By:', zoho_name: '', fullRow: true },
]