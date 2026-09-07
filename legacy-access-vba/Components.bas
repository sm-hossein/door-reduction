Attribute VB_Name = "Components"
Option Compare Text   'Use database order for string comparisons

Function GetComponentDescription(parmDescription, parmGroup, parmCategory, parmSection)

GetComponentDescription = parmDescription

Select Case parmGroup
  Case "Frame"
    Select Case parmCategory
      Case "Horz"
        If (parmSection = "Bottom") Then
        lclCrossTube = GetActualHeight("Cross Tube")
        Select Case lclCrossTube
          Case 1
            GetComponentDescription = gbl1x3CrossTube
            gblNotes = "Use " & gbl1x3CrossTube & ".  "
          Case 2
            GetComponentDescription = gbl1x4CrossTube
            gblNotes = "Use " & gbl1x4CrossTube & ".  "
          End Select
        End If

      Case "Lock Tube"
        GetComponentDescription = gblLockTube
        If (IsOperator() And (gblProductType = "Door" Or gblProductType = "Gate")) Then
          GetComponentDescription = parmDescription & " - " & GetOrderType("Lock", gblLock)
        End If
    End Select

  Case "Opening"
    Select Case parmCategory
      Case "Z-bar"
        If (gblType = "French" And parmDescription = "Astrical") Then
            gblNotes = "Punch top down"
            GetComponentDescription = parmDescription & " - " & GetOrderType("Lock", gblLock)
        End If

        If ((gblType = "Patio" Or gblType = "French") And parmDescription = "Header") Then
            gblNotes = "Punch 1 side only"
        End If

        If ((gblType = "Patio" Or gblType = "Single" Or gblType = "1 Sidelite" Or gblType = "2 Sidelite") And parmDescription = "Jambs") Then
            If (gblHinge = "Right") Then
                gblNotes = "Punch Left side top down.  " & gblNotes
            Else
                gblNotes = "Punch Right side top down.  " & gblNotes
            End If
        End If
    End Select
End Select
End Function

Function GetComponentSection(parmDescription, parmGroup, parmCategory, parmSection)

'*** Get the section for the component, normally this will
'***  will be the same section as was passed.  Exceptions
'***  are listed below.
GetComponentSection = parmSection
            
If (parmSection = "Side") Then
  GetComponentSection = "Left/Right"
End If

'*** Work with Frame components.
Select Case gblProductType
  Case "Door", "Gate"
    Select Case parmGroup
      Case "Frame"

'*** Get the side for the Hinge. This will be the same as
'***  the hinge.
        Select Case parmCategory
          Case "Hinge"
            GetComponentSection = GetOptions("Hinge")

'*** Get the side for the Lock Tube.  This will be the opposite of
'***  the hinge.
          Case "Lock Tube"
            If (GetOptions("Hinge") = "Left") Then
              GetComponentSection = "Right"
            Else
              GetComponentSection = "Left"
            End If
        End Select
    End Select

'*** Use this for the Frames
  Case "1 Frame", "2 Frame", "1 Sidelite", "2 Sidelite"
    Select Case parmGroup
      Case "Frame"
        Select Case parmCategory
          Case "Vert"
            Select Case parmSection
              Case "Side"
                If Not (gblProductType = "2 Sidelite") Then
                  If (gblProductType = "1 Frame") Then
                    If (gblHinge = "Right") Then
                     gblNotes = gblNotes & "Add cut-out to left tube.  "
                    Else
                      gblNotes = gblNotes & "Add cut-out to right tube.  "
                    End If
                  Else
                    If Not (gblOperator = gblHinge) Then
                      gblNotes = gblNotes & "Add cut-out to " & gblOperator & " tube.  "
                    End If
                  End If
                End If
              Case "Center"
                If (gblProductType = "2 Sidelite") Then
                  If (gblHinge = "Right") Then
                    gblNotes = gblNotes & "Add cut-out to left center tube.  "
                  Else
                    gblNotes = gblNotes & "Add cut-out to right center tube.  "
                  End If
                ElseIf (gblOperator = gblHinge) Then
                  gblNotes = gblNotes & "Add cut-out to center tube.  "
                End If
            End Select
        End Select
    End Select
End Select

End Function

Function GetComponentSize(parmDescription, parmGroup, parmCategory, parmSection)

Dim db As Database, tblGeneric As DAO.Recordset

'*** Move to Global section
gblExpanderWidthReduce = 0.125
gblGlassFrameAdjust = 0.75
gblSection = parmSection

Set db = CurrentDb()
Set tblGeneric = db.OpenRecordset("Component Size Rules", dbOpenTable)
tblGeneric.Index = "Index1"
tblGeneric.Seek "=", gblProductType, parmGroup, parmCategory, parmSection

'*** If record is not found in the table, there is no sizing
'***  rule for this component
If tblGeneric.NoMatch Then
  GetComponentSize = ""
  Exit Function

'*** Get the sizing rule
Else
  lclRule = tblGeneric("Sizing Rule")
End If

'*** Figure out the size based on the rule
Select Case lclRule
  Case "Std Height"
    GetComponentSize = Dimensions("Height", 0, GetSize("Total Height"))
  
  Case "Std Center Height"
    GetComponentSize = Dimensions("Height", 0, GetSize("Total Height") - (gblFrameWidth / 2))

  Case "Std Full Height"
    GetComponentSize = Dimensions("Height", 0, GetSize("Total Height") - gblFrameWidth)
  
  Case "Std Lock Tube Height"
    If Not (gblGlassType = "One") Then
      If (gblGlassType = "Two SS") Then
         lclHeightAbove = Dimensions("Height", 0, GetActualHeight("Top Picket") + (gblFrameWidth / 2) - 0.25)
         lclHeightBelow = Dimensions("Height", 0, GetActualHeight("Bottom Picket") + (gblFrameWidth / 2) - 0.25)
      Else
         lclHeightAbove = Dimensions("Height", 0, GetActualHeight("Top Picket") + (gblFrameWidth / 2))
         gblTopPicketHeight = GetActualHeight("Top Picket") + (gblFrameWidth / 2)
         lclHeightBelow = Dimensions("Height", 0, GetActualHeight("Bottom Picket") + (gblFrameWidth / 2) + GetActualHeight("Cross Tube"))
      End If
      If (IsOperator()) Then
        gblNotes = "Cut " & lclHeightAbove & """ above lock.  "
        gblNotes = gblNotes & "Cut " & lclHeightBelow & """ below lock.  "
      Else
      gblNotes = "Use " & gblLockTube & ".  "
        If (gblType = "French") Then
          gblNotes = gblNotes & "Add cut-out to tube.  "
        End If
      End If
    End If
    GetComponentSize = Dimensions("Height", 0, GetSize("Total Height"))
  
  Case "Std Gate Lock Tube Height"
    lclHeight = Dimensions("Height", 0, (GetSize("Total Height") - GetLockSize("Height")) / 2)
    gblNotes = "Cut " & lclHeight & """ above lock.  "
    gblNotes = gblNotes & "Cut " & lclHeight & """ below lock.  "
    GetComponentSize = Dimensions("Height", 0, GetSize("Total Height"))
  
  Case "Std Width"
    GetComponentSize = Dimensions("Width", GetSize("Total Width") - gblFrameWidth, 0)
  
  Case "Std Frame Width"
    GetComponentSize = Dimensions("Width", GetSize("Total Width") - gblFrameWidth, 0)
  
  Case "Std 2 Frame Width"
    GetComponentSize = Dimensions("Width", (GetSize("Total Width") / 2) - (gblFrameWidth * 1.5) + gblDoubleGateAdjust, 0)
  
  Case "Std Sidelite Width"
    GetComponentSize = Dimensions("Width", ((GetSize("Total Width") - gblDoorTotalWidth) - (gblFrameWidth * 1.5)), 0)
  
  Case "Std 2 Sidelite Top Frame Width"
    GetComponentSize = Dimensions("Width", (((GetSize("Total Width") - gblDoorTotalWidth) / 2) - (gblFrameWidth / 2)), 0)
  
  Case "Std 2 Sidelite Center Width"
    GetComponentSize = Dimensions("Width", gblDoorTotalWidth, 0)
  
  Case "Std 2 Sidelite Width"
    GetComponentSize = Dimensions("Width", (((GetSize("Total Width") - gblDoorTotalWidth) / 2) - gblFrameWidth), 0)
  
  Case "Std Top Picket"
    lclHeight = GetActualHeight("Top Picket")
    GetComponentSize = Dimensions("Height", 0, lclHeight)
  
  Case "Std Top Picket - Middle"
    lclHeight = (GetActualHeight("Top Picket") - 4)
    GetComponentSize = Dimensions("Height", 0, lclHeight)

  Case "Std Top Picket - Inside"
    lclHeight = (GetActualHeight("Top Picket") - 7.125)
    GetComponentSize = Dimensions("Height", 0, lclHeight)

  Case "Std Top Picket - Outside"
    lclHeight = (GetActualHeight("Top Picket") - 9.25)
    GetComponentSize = Dimensions("Height", 0, lclHeight)
      
  Case "Std Top Picket - SmFrz"
    lclHeight = (GetActualHeight("Top Picket") - 5.25)
    GetComponentSize = Dimensions("Height", 0, lclHeight)
       
  Case "Std Bottom Picket - SmFrz"
    lclHeight = (GetActualHeight("Bottom Picket") - 5.25)
    GetComponentSize = Dimensions("Height", 0, lclHeight)
    
   Case "Std Top Picket - StFrz"
    lclHeight = (GetActualHeight("Top Picket") - (GetLockSize("Height") - 1))
    GetComponentSize = Dimensions("Height", 0, lclHeight)
       
  Case "Std Bottom Picket - StFrz"
    lclHeight = (GetActualHeight("Bottom Picket") - (GetLockSize("Height") - 1))
    GetComponentSize = Dimensions("Height", 0, lclHeight)
         
  Case "Std Top Picket - 203O"
    lclHeight = (GetActualHeight("Top Picket") - 8.5)
    GetComponentSize = Dimensions("Height", 0, lclHeight)
       
  Case "Std Bottom Picket - 203O"
    lclHeight = (GetActualHeight("Bottom Picket") - 8.5)
    GetComponentSize = Dimensions("Height", 0, lclHeight)
      
  Case "Std Top Picket - 203I"
    lclHeight = (GetActualHeight("Top Picket") - 4.1875)
    GetComponentSize = Dimensions("Height", 0, lclHeight)
       
  Case "Std Bottom Picket - 203I"
    lclHeight = (GetActualHeight("Bottom Picket") - 4.1875)
    GetComponentSize = Dimensions("Height", 0, lclHeight)
      
  Case "Std Width - 203"
    lclWidth = 3
    GetComponentSize = Dimensions("Width", 0, lclWidth)
   
    
  Case "Std Top Picket - Sunrise"
    lclHeight = GetSize("Total Width") - gblFrameWidth
    lclHeight = (lclHeight / 2) + 0.4375
    GetComponentSize = Dimensions("Height", 0, lclHeight)

  Case "Std Top Picket - Crowned"
    lclHeight = GetActualHeight("Top Picket") - 14.875
    GetComponentSize = Dimensions("Height", 0, lclHeight)

  Case "Std Bottom Picket"
    lclHeight = GetActualHeight("Bottom Picket")
    GetComponentSize = Dimensions("Height", 0, lclHeight)

  Case "Std Center Picket"
    lclHeight = GetLockSize("Height") - 2.0625
    GetComponentSize = Dimensions("Height", 0, lclHeight)

  Case "Std Sidelite Top Picket"
    lclHeight = gblTopPicketHeight + 0.25
    GetComponentSize = Dimensions("Height", 0, lclHeight)
  
  Case "Std Sidelite Bottom Picket"
    lclHeight = gblTotalHeight - (gblTopPicketHeight + gblFrameWidth + GetLockSize("Height") + 0.25)
    GetComponentSize = Dimensions("Height", 0, lclHeight)

  Case "Std Internal Center Width"
    lclWidth = GetSize("Total Width") - gblFrameWidth
    If Not (GetOptions("Lock") = "None") Then
      lclWidth = lclWidth - GetLockSize("Width")
    End If
    GetComponentSize = Dimensions("Width", lclWidth, 0)
  
  Case "Top Glass"
    lclWidth = GetActualWidth("Glass")
    If Not (gblGlassType = "Two SS") Then
      gblNotes = gblNotes & "Framed Size = " & Dimensions("Both", lclWidth + gblGlassFrameAdjust, GetActualHeight("Top Glass") + gblGlassFrameAdjust)
    End If
    GetComponentSize = Dimensions("Both", lclWidth, GetActualHeight("Top Glass"))

  Case "Bottom Glass"
    lclWidth = GetActualWidth("Glass")
    If Not (gblGlassType = "Two SS") Then
      gblNotes = gblNotes & "Framed Size = " & Dimensions("Both", lclWidth + gblGlassFrameAdjust, GetActualHeight("Bottom Glass") + gblGlassFrameAdjust)
    End If
    GetComponentSize = Dimensions("Both", lclWidth, GetActualHeight("Bottom Glass"))
  
  Case "Center Glass"
    lclWidth = GetActualWidth("Glass")
    If Not (GetOptions("Lock") = "None") Then
      lclWidth = lclWidth - 2.5
    End If
    gblNotes = gblNotes & "Framed Size = " & Dimensions("Both", lclWidth + gblGlassFrameAdjust, 5.5 + gblGlassFrameAdjust)
    GetComponentSize = Dimensions("Both", lclWidth, 5.5)

  Case "Top Screen"
    lclWidth = GetActualWidth("Screen")
    GetComponentSize = Dimensions("Both", lclWidth + gblGlassFrameAdjust, GetActualHeight("Top Screen") + gblGlassFrameAdjust)

  Case "Bottom Screen"
    lclWidth = GetActualWidth("Screen")
    GetComponentSize = Dimensions("Both", lclWidth + gblGlassFrameAdjust, GetActualHeight("Bottom Screen") + gblGlassFrameAdjust)
  
  Case "Center Screen"
    lclWidth = GetActualWidth("Screen")
    If Not (GetOptions("Lock") = "None") Then
      lclWidth = lclWidth - 2.5
    End If
    GetComponentSize = Dimensions("Both", lclWidth + gblGlassFrameAdjust, 5.5 + gblGlassFrameAdjust)

'*** These rules apply to opening components
  Case "Expander"
    GetComponentSize = Dimensions("Width", GetSize("Total Width") - gblExpanderWidthReduce, 0)

  Case "Jambs"
    If (GetSize("Total Height") <= 82) Then
      GetComponentSize = Dimensions("Height", 0, 85)
    Else
      GetComponentSize = ""
      gblNotes = gblNotes & "Shop must punch.  "
    End If

  Case "Header"
    GetComponentSize = Dimensions("Width", gblTotalWidth + 2, 0)

  Case "Legs"
    GetComponentSize = Dimensions("Width", gblTotalLegLength + 1, 0)

'*** This is bad.  we have a rule in the table but no rule
'***  here.  Warn user.

  Case Else
    MsgBox "Undefined Component sizing rule - " & lclRule
End Select

End Function


