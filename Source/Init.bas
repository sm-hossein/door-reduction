Attribute VB_Name = "Init"
Option Compare Text   'Use database order for string comparisons

'*** Global variables for door
'*** Used to avoid extra database searches
Global gblTotalWidth As Single
Global gblTotalHeight As Single
Global gblDoorTotalWidth As Single
Global gblDoorTotalHeight As Single
Global gblDoorSide As String
Global gblRecordID As String
Global gblHinge As String
Global gblLock As String
Global gblType As String
Global gblOperator As String
Global gblDoorID As Long
Global gblProductID As String
Global gblSecondaryProductID As String
Global gblProductType As String
Global gblCurrentSide As String
Global gblGlassType As String
Global gblSection As String
Global gblNewline As String
Global gbltitle As String

'*** Global variables for rules
Global gblOpeningWidthReduce As Single
Global gblOpeningHeightReduce As Single
Global gblPatioDoorIncrease As Single
Global gblFrameWidth As Single
Global gblDoubleGateAdjust As Single
Global gblHoletoHoleAdjust As Single
Global gblMaxDoorDiff As Single
Global gblTopMaxHeightAdjust As Single
Global gblTopMinHeightAdjust As Single
Global gblGlassMaxWidthAdjust As Single
Global gblGlassMinWidthAdjust As Single
Global gblGlassMaxHeightAdjust As Single
Global gblGlassMinHeightAdjust As Single
Global gblExpanderMaxHeightAdjust As Single
Global gblExpanderMinHeightAdjust As Single
Global gblCrossTubeMaxHeightAdjust As Single
Global gblCrossTubeHeightAdjust As Single
Global gblStandardDrillAt As Single
Global gblHandleMinHeight As Single
Global gblHandleMaxHeight As Single
Global gblHandleStdHeight As Single
Global gblTopPicketHeight As Single
Global gblTotalLegLength As Single
Global gblRefWidth1 As Single
Global gblRefWidth2 As Single
Global gblRefHinge1 As String
Global gblRefHinge2 As String
Global gblRefLock1 As String
Global gblRefLock2 As String

'*** Global variables for User Strings
Global gbl1x3CrossTube As String
Global gbl1x4CrossTube As String
Global gblLockTube As String
Global gblNotes As String


Function GetOrderType(parmKey, parmOrderType)

Dim db As Database, tblGeneric As DAO.Recordset

'*** Get Product Information
Set db = CurrentDb()
Set tblGeneric = db.OpenRecordset("Reference Codes", dbOpenTable)
tblGeneric.Index = "Index1"
tblGeneric.Seek "=", parmKey, parmOrderType

'*** Save record variables
GetOrderType = tblGeneric("Reference Description")

End Function

Function GetProductID(parmOption)

gblRecordID = parmOption

Select Case gblRecordID
  Case "1"
    gblCurrentSide = "Left"
    lclProductID = gblProductID
  Case "2"
    gblCurrentSide = "Right"
    lclProductID = gblProductID
  Case "3"
    gblCurrentSide = "Left"
    lclProductID = gblSecondaryProductID
End Select

lclDummyVar = SetProductVariables(lclProductID)
GetProductID = lclProductID

End Function

Function SetDoorVariables(parmID)

Dim db As Database, tblGeneric As DAO.Recordset


On Error Resume Next

'*** Get the current record
Set db = CurrentDb()
Set tblGeneric = db.OpenRecordset("Door", dbOpenTable)
tblGeneric.Index = "PrimaryKey"
tblGeneric.Seek "=", parmID

'*** Save record variables
gblType = tblGeneric("Type")
gblHinge = tblGeneric("Hinge")
gblOperator = tblGeneric("Operator")
gblProductID = tblGeneric("Product ID")
gblSecondaryProductID = tblGeneric("Secondary Product ID")
gblDoorSide = tblGeneric("Door Side")
gblDoorID = tblGeneric("Door ID")
gblLock = tblGeneric("Lock")

'*** Calculate opening width and height
gblTotalWidth = tblGeneric("Width") + tblGeneric("Width Fraction")
gblTotalHeight = tblGeneric("Height") + tblGeneric("Height Fraction")

'*** Calculate Door width and height
gblDoorTotalWidth = tblGeneric("Door Width") + tblGeneric("Door Width Fraction")
gblDoorTotalHeight = tblGeneric("Door Height") + tblGeneric("Door Height Fraction")

'*** Calculate Leg length
gblTotalLegLength = tblGeneric("Leg Length") + tblGeneric("Leg Length Fraction")
 
End Function

Function SetGlobalVariables(parmID)

On Error Resume Next

'*** Global variables for rules
gblOpeningWidthReduce = 0.625
gblOpeningHeightReduce = 1
gblPatioDoorIncrease = 0.25
gblDoubleGateAdjust = 0.125
gblHoletoHoleAdjust = 1
gblMaxDoorDiff = 0.25
gblTopMaxHeightAdjust = 5
gblTopMinHeightAdjust = -5
gblGlassMaxWidthAdjust = 0.5
gblGlassMinWidthAdjust = -0.5
gblGlassMaxHeightAdjust = 0
gblGlassMinHeightAdjust = -1
gblExpanderMaxHeightAdjust = 1.25
gblExpanderMinHeightAdjust = -0.25
gblCrossTubeMaxHeightAdjust = 2
gblCrossTubeHeightAdjust = 0
gblStandardDrillAt = 0.875
gblHandleMinHeight = 35.5
gblHandleStdHeight = 37
gblHandleMaxHeight = 45
gblTopPicketHeight = 0
gblNewline = Chr$(13) + Chr$(10)

'*** Global variables for Strings
gbl1x3CrossTube = "1x3 Cross Tube"
gbl1x4CrossTube = "1x4 Cross Tube"
gblLockTube = "1x2 Tube"
gblNotes = ""

'*** Other Global variables
gblDoorID = parmID
gblCurrentSide = "Left"
gblRecordID = "1"
gblRefWidth1 = 0
gblRefWidth2 = 0
gblRefHinge1 = ""
gblRefHinge2 = ""
gblRefLock1 = ""
gblRefLock2 = ""

lclDummyVar = SetDoorVariables(parmID)
lclDummyVar = SetProductVariables(gblProductID)

End Function

Function SetProductVariables(parmID)

Dim db As Database, tblGeneric As DAO.Recordset

On Error Resume Next

'*** Get Product Information
Set db = CurrentDb()
Set tblGeneric = db.OpenRecordset("Product", dbOpenTable)
tblGeneric.Index = "PrimaryKey"
tblGeneric.Seek "=", parmID

'*** Save record variables
gblProductType = tblGeneric("Product Type")
gblGlassType = tblGeneric("Glass Type")

Select Case gblProductType
  Case "Door"
    gblFrameWidth = 4
  Case "Gate", "1 SideLite", "2 Sidelite", "1 Frame", "2 Frame", "Window"
    gblFrameWidth = 2
End Select


End Function

Function StartUp()

'/ Following 6 lines commented out by SIS 8/31/99
'/ Code set "View Built-In Toolbars" to "No" and hid the database window.
'/ These functions moved to "Startup" properities (under "Tools").

'DoCmd.Echo False
'DoEvents
'SendKeys "{Tab 3}No{Enter}"
'DoCmd.DoMenuItem 0, 2, 4
'DoCmd.DoMenuItem 1, 4, 3
'DoCmd.Echo True
          
'DoCmd.OpenForm "frmIntro"
'DoCmd.OpenForm "Job Order List", A_NORMAL

End Function


