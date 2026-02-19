Attribute VB_Name = "Calculations"
Option Compare Text   'Use database order for string comparisons

Function GetActualHeight(parmPhase)

lclCustom = "No"
lclNumberGlass = 2
lclGlass = 2
lclPushGlassDown = 0
lclGlassSizeAdjust = 0
lclCrossTubeAdjust = 0
lclGlassAdjust = 0

Select Case gblGlassType
  Case "One"
    lclStdPicketHeight = 74
    lclStdGlassHeight = 74
    lclAdditionalCrossBarAdjust = 1
  Case "Two"
    lclStdPicketHeight = 36.5
    lclStdGlassHeight = 36.5
    lclAdditionalCrossBarAdjust = 0
  Case "Two SS"
    lclStdPicketHeight = 36.75
    lclStdGlassHeight = 34.625
    lclAdditionalCrossBarAdjust = 0
  Case "Three"
    lclStdPicketHeight = 37.5 - (GetLockSize("Height") / 2)
    lclStdGlassHeight = 33.5
    lclAdditionalCrossBarAdjust = 0
End Select

'*** If Standard glass cannot be used because of the width
'***  then just size the door for the opening
If Not (parmPhase = "Initial") Then
  lclNumberGlass = GetActualWidth("Initial")
End If

lclTotalHeight = GetSize("Initial Height")

If (lclNumberGlass = 0) Then
  lclCustom = "Yes"

'*** Some standard glass can be used so optimize with
'***  various parts
Else
  Select Case gblGlassType
    Case "One"
      Select Case lclTotalHeight
        Case Is > 83.25
          lclCustom = "Yes"
        Case Is > 82.25
          lclDoorheight = 81
          lclCrossTubeAdjust = 2
        Case Is > 81.25
          lclDoorheight = 80
          lclCrossTubeAdjust = 1
        Case Is >= 79.75
          lclDoorheight = 79
        Case Is >= 78.75
          lclDoorheight = 78
          lclPushGlassDown = 1
          lclPicketHeightAdjust = -1
        Case Else
          lclCustom = "Yes"
      End Select

    Case "Two"
      Select Case lclTotalHeight
        Case Is > 83.25
          lclCustom = "Yes"
        Case Is > 82.25
          lclDoorheight = 81
          lclCrossTubeAdjust = 2
        Case Is > 81.25
          lclDoorheight = 80
          lclCrossTubeAdjust = 1
        Case Is >= 79.75
          lclDoorheight = 79
        Case Is >= 78.75
          lclDoorheight = 78
          lclPushGlassDown = 1
          lclPicketHeightAdjust = -1
        Case Is >= 77.75
          lclDoorheight = 77
          lclGlassSizeAdjust = -3
          lclCrossTubeAdjust = 1
          lclPushGlassDown = 1
          lclPicketHeightAdjust = -3
        Case Is >= 76.75
          lclDoorheight = 76
          lclGlassSizeAdjust = -3
          lclPicketHeightAdjust = -3
        Case Is >= 75.75
          lclDoorheight = 75
          lclGlassSizeAdjust = -3
          lclPushGlassDown = 1
          lclPicketHeightAdjust = -4
        Case Else
          lclCustom = "Yes"
      End Select

    Case "Two SS"
      Select Case lclTotalHeight
        Case Is > 83.25
          lclCustom = "Yes"
        Case Is > 82.25
          lclDoorheight = 81
        Case Is > 81.25
          lclDoorheight = 80
        Case Is >= 79.75
          lclDoorheight = 79
        Case Is >= 78.75
          lclDoorheight = 78
        Case Is >= 77.75
          lclDoorheight = 77
        Case Is >= 76.75
          lclDoorheight = 76
        Case Is >= 75.75
          lclDoorheight = 75
        Case Else
          lclCustom = "Yes"
      End Select

    Case "Three"
      Select Case lclTotalHeight
        Case Is > 86.25
          lclCustom = "Yes"
        Case Is > 85.25
          lclStdPicketHeight = lclStdPicketHeight + 3
          lclStdGlassHeight = lclStdGlassHeight + 3
          lclDoorheight = 84
          lclGlassSizeAdjust = -3
          lclCrossTubeAdjust = 2
          lclPicketHeightAdjust = -3
        Case Is > 84.25
          lclStdPicketHeight = lclStdPicketHeight + 3
          lclStdGlassHeight = lclStdGlassHeight + 3
          lclDoorheight = 83
          lclGlassSizeAdjust = -3
          lclPicketHeightAdjust = -3
          lclCrossTubeAdjust = 1
        Case Is >= 83
          lclStdPicketHeight = lclStdPicketHeight + 3
          lclStdGlassHeight = lclStdGlassHeight + 3
          lclDoorheight = 82
          lclGlassSizeAdjust = -3
          lclPicketHeightAdjust = -3
        Case Is > 82.25
          lclDoorheight = 81
          lclCrossTubeAdjust = 2
        Case Is > 81.25
          lclDoorheight = 80
          lclCrossTubeAdjust = 1
        Case Is >= 79.75
          lclDoorheight = 79
        Case Is >= 78.75
          lclDoorheight = 78
          lclPushGlassDown = 1
          lclPicketHeightAdjust = -1
        Case Else
          lclCustom = "Yes"
      End Select
  End Select
End If

If (lclCustom = "Yes") Then
  lclDoorheight = lclTotalHeight - gblOpeningHeightReduce
  lclGlassAdjust = 9999
  Select Case gblGlassType
    Case "One"
      lclGlass = 0
    Case "Two", "Two SS", "Three"
      lclGlass = 1
  End Select
End If

'*** Process the request
Select Case parmPhase
  Case "Initial"
    GetActualHeight = lclNumberGlass

  Case "Full Height"
    GetActualHeight = lclDoorheight

  Case "Cross Tube"
    GetActualHeight = lclCrossTubeAdjust

  Case "Glass Comment"
    GetActualHeight = lclGlassAdjust

  Case "Glass"
    GetActualHeight = lclGlassSizeAdjust

  Case "Push Glass Down"
    GetActualHeight = lclPushGlassDown

  Case "Top Glass", "Top Screen"
    If (lclCustom = "Yes") Then
      If Not (lclNumberGlass = 0) Then
        If (parmPhase = "Top Glass") Then
          gblNotes = "Custom glass.  " & gblNotes
        Else
          gblNotes = "Custom screen.  " & gblNotes
        End If
      End If
      GetActualHeight = lclDoorheight - lclGlassSizeAdjust - lclCrossTubeAdjust - gblFrameWidth - GetLockSize("Height Glass") - (lclStdPicketHeight + lclPicketHeightAdjust) + 0.5
    Else
      GetActualHeight = lclStdGlassHeight + 0.5
    End If

    If (gblGlassType = "Two SS") Then
      GetActualHeight = lclDoorheight - 42.375
    End If

  Case "Bottom Glass", "Bottom Screen"
    GetActualHeight = lclStdGlassHeight + lclGlassSizeAdjust + 0.5
    
    If (gblGlassType = "One" And lclCustom = "Yes") Then
      GetActualHeight = lclDoorheight - gblFrameWidth - 1 + 0.5
    End If
    
    ' If (parmPhase = "Bottom Glass") Then
      ' If (lclGlassSizeAdjust > 0) Then
        ' gblNotes = "Use +" & LTrim(Str(lclGlassSizeAdjust)) & """ Std Glass.  " & gblNotes
      ' End If

      ' If (lclGlassSizeAdjust < 0) Then
        ' gblNotes = "Use " & LTrim(Str(lclGlassSizeAdjust)) & """ Std Glass.  " & gblNotes
      ' End If
    ' End If

  Case "Bottom Picket"
    GetActualHeight = lclStdPicketHeight + lclPicketHeightAdjust

    If (lclPicketHeightAdjust > 0) Then
      gblNotes = gblNotes & "Use +" & LTrim(Str(lclPicketHeightAdjust)) & """ Pickets.  "
    End If

    If (lclPicketHeightAdjust < 0) Then
      gblNotes = gblNotes & "Use " & LTrim(Str(lclPicketHeightAdjust)) & """ Pickets.  "
    End If

  Case "Top Picket"
    lclHeight = lclDoorheight - lclCrossTubeAdjust - gblFrameWidth - GetLockSize("Height") - (lclStdPicketHeight + lclPicketHeightAdjust)
    
    If (gblGlassType = "Two SS") Then
      lclHeight = lclHeight + 0.5
    End If

    GetActualHeight = lclHeight

    If Not (lclHeight = lclStdPicketHeight) Then
      gblNotes = "Cut Pickets " & Dimensions("Height", 0, lclHeight) & ".  "
    End If
End Select

End Function

Function GetActualWidth(parmPhase)

Dim lclSizeDiff1 As Single, lclSizeDiff2 As Single, lclSizeDiff3 As Single

lclNumberGlass = 2

'*** If only a single door then you can have any door difference,
'***  otherwise, divide by two
Select Case gblType
  Case "Single", "1 Sidelite", "2 Sidelite"
    lclMaxDoorDiff = 0
    gblRefWidth1 = GetSize("Initial Width")
  Case Else
    lclMaxDoorDiff = (gblMaxDoorDiff / 2)
End Select

'*** Get Standard doors for width
lclTotalWidth = GetSize("Initial Width") + gblOpeningWidthReduce

If Not (parmPhase = "Initial") Then
  lclStandardGlass = GetActualHeight("Initial")
End If

If ((Abs(lclTotalWidth - 36) - gblGlassMinWidthAdjust) <= (Abs(lclTotalWidth - 32) + gblGlassMaxWidthAdjust)) Then
  lclSizeDiff = lclTotalWidth - 36
  lclGlassWidth = 36
ElseIf ((Abs(lclTotalWidth - 32) - gblGlassMinWidthAdjust) <= (Abs(lclTotalWidth - 30) + gblGlassMaxWidthAdjust)) Then
  lclSizeDiff = lclTotalWidth - 32
  lclGlassWidth = 32
Else
  lclSizeDiff = lclTotalWidth - 30
  lclGlassWidth = 30
End If

'*** Check to see if we can use standard glass or return the width
'*** of the door
If (lclSizeDiff <= gblGlassMaxWidthAdjust And lclSizeDiff >= gblGlassMinWidthAdjust) Then
  lclNumberGlass = 2
  If (Abs(lclSizeDiff) > lclMaxDoorDiff) Then
    lclGlassAdjust = gblStandardDrillAt - (lclSizeDiff / 2)
    lclDoorWidth = GetSize("Initial Width")

    If (gblRefWidth1 = 0) Then
        gblRefWidth1 = lclDoorWidth
        gblRefWidth2 = lclDoorWidth
    End If

'*** If door is the operator, adjust to use the standard components
  Else
    If (IsOperator()) Then
      lclGlassAdjust = gblStandardDrillAt
      lclDoorWidth = GetSize("Initial Width") - lclSizeDiff

'*** Not the operator, adjust size differently.
    Else
      lclGlassAdjust = gblStandardDrillAt - (lclSizeDiff / 1)
      lclDoorWidth = GetSize("Initial Width") + lclSizeDiff
    End If

    If (gblRefWidth1 = 0) Then
      If (IsOperator()) Then
        gblRefWidth1 = GetSize("Initial Width") - lclSizeDiff
        gblRefWidth2 = GetSize("Initial Width") + lclSizeDiff
      Else
        gblRefWidth1 = GetSize("Initial Width") + lclSizeDiff
        gblRefWidth2 = GetSize("Initial Width") - lclSizeDiff
      End If
    End If
  End If

'*** Standard Glass could not be used in both doors, check to see if
'***  it can be used in one door
'*** Perform the calculations for each of the doors.  If the height
'***  check indicates that no standard doors can be used, just use
'***  normal values.
Else
  If ((lclSizeDiff <= (gblGlassMaxWidthAdjust + lclMaxDoorDiff) And lclSizeDiff >= gblGlassMinWidthAdjust - lclMaxDoorDiff)) Then
    lclNumberGlass = 2
    If Not (parmPhase = "Initial") Then
      lclStandardGlass = GetActualHeight("Initial")
    End If

    If (lclStandardGlass = 0) Then
      lclDoorWidth = GetSize("Initial Width")
      If (gblRefWidth1 = 0) Then
          gblRefWidth1 = lclDoorWidth
          gblRefWidth2 = lclDoorWidth
      End If
    
'*** The fun begins.  Determine the door width depending on whether
'***  the door is operator door or the other one.  The operator will
'***  always use the standard glass.
    Else
      If (lclSizeDiff < 0) Then
        lclCompensate = lclSizeDiff - gblGlassMinWidthAdjust
        lclGlassAdjust = gblGlassMinWidthAdjust
      Else
        lclCompensate = lclSizeDiff - gblGlassMaxWidthAdjust
        lclGlassAdjust = gblGlassMaxWidthAdjust
      End If

'*** If door is the operator, adjust to use the standard glass piece
      If (IsOperator()) Then
        lclGlassAdjust = gblStandardDrillAt + (lclGlassAdjust / 2)
        lclDoorWidth = GetSize("Initial Width") - lclCompensate

'*** Not the operator, adjust size differently.  This door will not
'***  use standard glass
      Else
        lclGlassAdjust = 9999
        lclDoorWidth = GetSize("Initial Width") + lclCompensate
      End If
          
      If (gblRefWidth1 = 0) Then
        If (IsOperator()) Then
          gblRefWidth1 = GetSize("Initial Width") - lclCompensate
          gblRefWidth2 = GetSize("Initial Width") + lclCompensate
        Else
          gblRefWidth1 = GetSize("Initial Width") + lclCompensate
          gblRefWidth2 = GetSize("Initial Width") - lclCompensate
        End If
      End If
    End If

'*** Standard glass cannot be used in either door.  Don't do any
'***  Fancy calculations.
  Else
    lclNumberGlass = 0
    lclGlassAdjust = 9999
    lclDoorWidth = GetSize("Initial Width")
    gblRefWidth1 = lclDoorWidth
    gblRefWidth2 = lclDoorWidth
  End If
End If

Select Case parmPhase
  Case "Initial"
    GetActualWidth = lclNumberGlass
  Case "Full Width"
    GetActualWidth = lclDoorWidth
  Case "Glass", "Screen"
    GetActualWidth = lclGlassWidth
    If (lclGlassAdjust = 9999) Then
      If (parmPhase = "Glass") Then
        gblNotes = "Custom glass.  " & gblNotes
      Else
        gblNotes = "Custom screen.  " & gblNotes
      End If
      GetActualWidth = lclDoorWidth - gblFrameWidth + 0.625
    Else
      If (gblGlassType = "Two SS") Then
        If (gblSection = "Top") Then
          GetActualWidth = lclDoorWidth - 5.625
        Else
          GetActualWidth = lclDoorWidth - 6.375
        End If
      Else
        GetActualWidth = lclDoorWidth - (2 * (gblStandardDrillAt - lclGlassAdjust)) - gblFrameWidth + 0.625
      End If
    End If
  Case "Glass Comment"
    GetActualWidth = lclGlassAdjust
End Select

End Function

Function GetBuildNotes()

'*** Needed since we are returning a string
Dim lclNotes As String

lclNotes = ""

'*** Glass comment
If (gblProductType = "Door" And Not gblGlassType = "Two SS") Then
  lclReturn = GetActualWidth("Glass Comment")
  If (lclReturn = 9999) Then
   lclNotes = lclNotes & "Custom glass needed for this door.  See glass notes below.  "
   lclReturn = gblStandardDrillAt
  Else
   lclReturn1 = GetActualHeight("Glass Comment")
   If (lclReturn1 = 9999) Then
    lclNotes = lclNotes & "Custom glass needed for this door.  See glass notes below.  "
    End If
  End If

  lclNotes = lclNotes & "Drill side holes at " & Dimensions("Width", lclReturn, 0) & ".  "

  lclReturn = GetActualHeight("Push Glass Down")
  If Not (lclReturn = 0) Then
   lclNotes = lclNotes & "Do not drill bottom glass holes.  Push Glass down" & Str(lclReturn) & """.  "
  End If
End If

If (gblProductType = "2 Frame") Then
  lclNotes = lclNotes & "Build frame with gate opening on the " & gblOperator & " side.  "
  lclNotes = lclNotes & gblNewline & "Hole to Hole distance = " & Dimensions("Width", GetSize("Total Width") + 2, 0) & ".  "
  lclNotes = lclNotes & gblNewline & "Bottom to Hole distance = " & Dimensions("Height", 0, GetSize("Total Height") + 1) & ".  "
End If

If (gblProductType = "1 Sidelite" Or gblProductType = "2 Sidelite") Then
  lclNotes = lclNotes & "Build sidelite with door hinge on the " & gblHinge & " side.  "
End If


GetBuildNotes = lclNotes
End Function

Function GetLockSize(parmOption)

GetLockSize = 0

'*** Perform the Calculations
Select Case gblLock
    Case "Yale"
        If (parmOption = "Width") Then
            GetLockSize = 4.4375 - (gblFrameWidth / 2)
        ElseIf (parmOption = "Height Glass") Then
            GetLockSize = 7.75
        Else
            GetLockSize = 7.5
        End If

    Case "Yale 1"
        If (parmOption = "Width") Then
            GetLockSize = 4.4375 - (gblFrameWidth / 2)
        Else
            GetLockSize = 4.25
        End If

    Case "Four Way"
        If (parmOption = "Width") Then
            GetLockSize = 4.1875 - (gblFrameWidth / 2)
        ElseIf (parmOption = "Height Glass") Then
            GetLockSize = 7.625
        Else
            GetLockSize = 7.25
        End If

    Case "Slim Line", "Bee Line", "None", "Cut Out", "Deluxe"
        If (parmOption = "Width") Then
            GetLockSize = 0
        Else
            GetLockSize = 2
        End If

    Case Else
        MsgBox "Error encountered in (GetLockSize) routine - " & parmLock

End Select

End Function

Function GetNotes()

GetNotes = gblNotes
gblNotes = " "

End Function

Function GetOptions(parmOption)

'*** This section will determine the side that the hinge goes on.
'*** (Left or Right)

Select Case parmOption
  Case "Hinge"
    Select Case gblProductType
      Case "Door"
        Select Case gblType
          Case "Patio", "Single", "1 Sidelite", "2 Sidelite"
            gblRefHinge1 = "  " & gblHinge & " hinge"
            gblRefHinge2 = "  " & gblHinge & " hinge"
            GetOptions = gblHinge
          Case "French"
            gblRefHinge1 = "  Left hinge"
            gblRefHinge2 = "  Right hinge"
            GetOptions = gblCurrentSide
        End Select
      Case "Gate"
        GetOptions = gblHinge
      Case "1 SideLite", "2 Sidelite", "1 Frame", "2 Frame", "Window"
        GetOptions = "None"
    End Select

'*** This section will determine the operator (Left, Right or None)
'*** as well as the lock (Specific Lock, None, or Cutout (French doors))

  Case "Lock"
    tempvalue = GetOrderType("Lock", gblLock)

    Select Case gblProductType
      Case "Door"
        Select Case gblType
          Case "Single", "1 Sidelite", "2 Sidelite"
          Case "French", "Patio"
            If Not (IsOperator()) Then
              tempvalue = "None"
            End If
          Case "Patio"
            tempvalue = "None"
        End Select
      Case "Gate"
      Case "1 SideLite", "2 Sidelite", "1 Frame", "2 Frame", "Window"
        tempvalue = "None"
    End Select

    If (gblRefLock1 = "") Then
      If (gblType = "French") Then
        tempCutOut = " with Cut-Out"
      Else
        tempCutOut = ", No Cut-Out"
      End If

      If (tempvalue = "None") Then
        gblRefLock1 = ", No lock" & tempCutOut
        gblRefLock2 = " with lock"
      Else
        gblRefLock1 = " with lock"
        gblRefLock2 = ", No lock" & tempCutOut
      End If
    End If
    GetOptions = tempvalue

  Case "Operator"
    tempvalue = gblOperator
    Select Case gblProductType
      Case "Door"
        Select Case gblType
          Case "Single", "2 Sidelite"
            GetOptions = " "
          Case "Patio"
            If (GetOptions("Hinge") = "Right") Then
              GetOptions = "Left operator"
            ElseIf (GetOptions("Hinge") = "Left") Then
              GetOptions = "Right operator"
            Else
              GetOptions = " "
            End If
          Case "1 Sidelite", "French"
              GetOptions = tempvalue & " operator"
        End Select
      Case "Gate"
        Select Case gblType
          Case "1 Gate"
            GetOptions = " "
          Case "2 Gate"
            GetOptions = tempvalue & " operator"
        End Select
      Case "1 SideLite", "2 Sidelite", "1 Frame", "2 Frame", "Window"
        GetOptions = " "
    End Select
End Select
End Function

Function GetSide()

Select Case gblRecordID

  Case "1", "2"
    Select Case gblType
      Case "Single", "1 Sidelite", "2 Sidelite", "1 Gate", "2 Gate"
        GetSide = "Door"
      Case "Patio", "French"
        GetSide = gblCurrentSide & " Door"
      Case "Window"
        GetSide = "Window"
    End Select

  Case "3"
    Select Case gblType
      Case "1 Sidelite", "2 Sidelite"
        GetSide = "Sidelite"
      Case "1 Gate", "2 Gate", "Patio"
        GetSide = "Frame"
      Case "Window"
        GetSide = "Window"
    End Select
End Select
End Function

Function GetSize(parmOption)

Dim lclTotalWidth As Single


'*** Perform the Calculations
Select Case parmOption
  Case "Total Width"
    Select Case gblProductType
      Case "Door"
        GetSize = GetActualWidth("Full Width")
      Case "Gate"
        Select Case gblType
          Case "1 Gate"
            GetSize = gblTotalWidth - gblOpeningWidthReduce - gblFrameWidth
          Case "2 Gate"
            GetSize = (gblTotalWidth / 2) - gblOpeningWidthReduce - gblDoubleGateAdjust
        End Select
      Case "1 SideLite", "2 Sidelite", "1 Frame", "2 Frame", "Window"
        If (gblType = "Patio") Then
          GetSize = gblTotalWidth + gblFrameWidth
        Else
          GetSize = gblTotalWidth
        End If
      Case Else
        MsgBox "Error encountered in (GetSize) routine"
    End Select

  Case "Total Height"
    Select Case gblProductType
      Case "Door"
        GetSize = GetActualHeight("Full Height")
      Case "Gate"
        GetSize = GetSize("Initial Height") - gblOpeningHeightReduce - (gblFrameWidth / 2) - 0.5
      Case "1 SideLite", "2 Sidelite", "1 Frame", "2 Frame", "Window"
        If (gblType = "Patio") Then
          GetSize = gblTotalHeight + (gblFrameWidth / 2)
        Else
          GetSize = GetSize("Initial Height")
        End If
      Case Else
        MsgBox "Error encountered in (GetSize) routine"
    End Select

  Case "Initial Width"
    lclTotalWidth = gblTotalWidth

'*** Increase width by 1/4 Inch (Variable) for Patio doors
    If (gblType = "Patio") Then
      lclTotalWidth = lclTotalWidth + gblPatioDoorIncrease
    End If

'*** I don't understand this, but for certain ranges we can
'***  adjust the width to make parts fit better.

    If (gblType = "French") Then
      If ((Abs(lclTotalWidth - 72)) <= (Abs(lclTotalWidth - 64))) Then
        lclSizeDiff = lclTotalWidth - 72
      ElseIf ((Abs(lclTotalWidth - 64)) <= (Abs(lclTotalWidth - 60))) Then
        lclSizeDiff = lclTotalWidth - 64
      Else
        lclSizeDiff = lclTotalWidth - 60
      End If

      If ((lclSizeDiff = 0.75) Or (lclSizeDiff <= -0.25 And lclSizeDiff >= -0.75) Or lclSizeDiff = -1.25) Then
        lclTotalWidth = lclTotalWidth + 0.25
      End If
    End If

'*** Divide the width by two if French or Patio doors
    If (gblType = "French" Or gblType = "Patio") Then
      lclTotalWidth = lclTotalWidth / 2
    End If

'*** Use door dimensions if a sidelite
    If (gblType = "1 Sidelite" Or gblType = "2 Sidelite") Then
      If (gblProductType = "Door") Then
        lclTotalWidth = gblDoorTotalWidth
      End If
    End If

'*** Reduce width for Opening
    lclTotalWidth = lclTotalWidth - gblOpeningWidthReduce
    GetSize = lclTotalWidth

  Case "Initial Height"
    lclTotalHeight = gblTotalHeight

    If (gblType = "1 Sidelite" Or gblType = "2 Sidelite") Then
      If (gblProductType = "Door") Then
        lclTotalHeight = gblDoorTotalHeight
      End If
    End If

    GetSize = lclTotalHeight
  
  Case "Dimensions"
    GetSize = Dimensions("Both", GetSize("Total Width"), GetSize("Total Height"))
  
  Case "Opening Dimensions"
    GetSize = Dimensions("Both", gblTotalWidth, gblTotalHeight)
  
  Case "Reference Dimension"
    Select Case gblType
      Case "Single", "French", "Patio", "1 Sidelite", "2 Sidelite"
        If (gblProductType = "Door") Then
            If (gblCurrentSide = "Left") Then
                GetSize = Dimensions("Both", gblRefWidth1 + gblOpeningWidthReduce, gblTotalHeight) & gblRefHinge1 & gblRefLock1
            Else
                GetSize = Dimensions("Both", gblRefWidth2 + gblOpeningWidthReduce, gblTotalHeight) & gblRefHinge2 & gblRefLock2
            End If
        End If
    End Select
  
  Case "Hole to Hole Dimensions"
    GetSize = Dimensions("Both", gblTotalWidth + (2 * gblHoletoHoleAdjust), gblTotalHeight + gblHoletoHoleAdjust)
    
  Case Else
    MsgBox "Error encountered in (GetSize) routine"

End Select
End Function

Function GetTableInformation(ParmTable, parmID, parmOption)

Dim db As Database, tblGeneric As DAO.Recordset
Set db = CurrentDb()

Select Case ParmTable
  Case "Component"
    'Set tblGeneric = db.OpenTable("Component")
    Set tblGeneric = db.OpenRecordset("Component", dbOpenTable)
    tblGeneric.Index = "PrimaryKey"
    tblGeneric.Seek "=", parmID
        
    If (tblGeneric.NoMatch = False) Then
      Select Case parmOption
        Case "Description"
          GetTableInformation = tblGeneric("Description")
        Case "Category"
          GetTableInformation = tblGeneric("Category")
        Case "Group"
          GetTableInformation = tblGeneric("Group")
        End Select
    End If
    
  Case "Product"
    'Set tblGeneric = db.OpenTable("Product")
    Set tblGeneric = db.OpenRecordset("Product", dbOpenTable)
    tblGeneric.Index = "PrimaryKey"
    tblGeneric.Seek "=", parmID

    If (tblGeneric.NoMatch = False) Then
      Select Case parmOption
        Case "Description"
          GetTableInformation = tblGeneric("Description")
        Case "Default Lock"
          GetTableInformation = tblGeneric("Default Lock")
        Case Else
          MsgBox "Error in (GetTableInformation)"
        End Select
    End If

End Select

End Function


Function GetPartSize(W, H) As Long
On Error GoTo 0

    Dim PartSize As Long
    Dim Chars As Long
    Dim PartString As String
    Dim CurrentCharacter As String
    Dim CycleCount As Long
    Dim Cycles As Long
        
    CycleCount = 1
    Chars = Len(Forms![CustomComponentForm]![CustomComponentSubform].Form![PartFormula])
        
        For Cycles = 1 To Chars
        CurrentCharacter = Mid(Forms![CustomComponentForm]![CustomComponentSubform].Form![PartFormula], CycleCount, 1)
        If CurrentCharacter = "H" Then
            PartString = PartString & H
            Else
                If CurrentCharacter = "W" Then
                        PartString = PartString & W
                        Else
                            PartString = PartString & CurrentCharacter
        End If
        End If
        CycleCount = CycleCount + 1
        Next Cycles
    
    PartSize = Eval(PartString)
    GetPartSize = PartSize
        

End Function

