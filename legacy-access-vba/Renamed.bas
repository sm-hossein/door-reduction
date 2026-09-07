Attribute VB_Name = "Renamed"
Option Compare Text   'Use database order for string comparisons

Function Component(parmObject, parmAction)

Select Case parmObject
  Case "OK"
    Select Case parmAction
      Case "Push"
        DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
        DoCmd.Close A_FORM, "Component"
    End Select

  Case "Cancel"
    Select Case parmAction
      Case "Push"
        On Error Resume Next
        DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
        DoCmd.DoMenuItem A_FORMBAR, A_EDIT, A_UNDO
        DoCmd.Close A_FORM, "Component"
    End Select

  Case "Form"
    Select Case parmAction
      Case "On Close"
        DoCmd.OpenForm "Component List", A_NORMAL
        DoCmd.Requery "lbComponent List"
      Case "On Current"
        DoCmd.GoToRecord A_FORM, "Component", A_FIRST
        DoCmd.GoToControl "tbDescription"
    End Select
End Select


End Function

Function ComponentList(parmObject, parmAction)

Select Case parmObject
  Case "Edit"
    Select Case parmAction
      Case "Push"
        If (Forms![Component List]![lbComponent List] <> "") Then
          DoCmd.OpenForm "Component", A_NORMAL, , "[Component ID] = Forms![Component List]![lbComponent List]", A_EDIT
        End If
    End Select

  Case "Add"
    Select Case parmAction
      Case "Push"
        DoCmd.OpenForm "Component", A_NORMAL, , , A_ADD
    End Select

  Case "Close"
    Select Case parmAction
      Case "Push"
        DoCmd.Close A_FORM, "Component List"
    End Select
End Select

End Function

Function CutSheet(parmObject, parmAction)

Select Case parmObject
  Case "Form"
    Select Case parmAction
      Case "On Open"
        Select Case gblType
          Case "Single"
            Forms![Cut Sheet]![btnDoor].Visible = -1
          Case "Patio"
            Forms![Cut Sheet]![btnLeft Door].Visible = -1
            Forms![Cut Sheet]![btnRight Door].Visible = -1
            Forms![Cut Sheet]![btnFrame].Visible = -1
          Case "French"
            Forms![Cut Sheet]![btnLeft Door].Visible = -1
            Forms![Cut Sheet]![btnRight Door].Visible = -1
          Case "1 Sidelite", "2 Sidelite"
            Forms![Cut Sheet]![btnDoor].Visible = -1
            Forms![Cut Sheet]![btnSidelite].Visible = -1
          Case "1 Gate", "2 Gate"
            Forms![Cut Sheet]![btnGate].Visible = -1
            Forms![Cut Sheet]![btnFrame].Visible = -1
          Case "Window"
        End Select
    End Select

  Case "OK"
    Select Case parmAction
      Case "Push"
        DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
        DoCmd.Close A_FORM, "Options"
    End Select

  Case "Cancel"
    Select Case parmAction
      Case "Push"
        On Error Resume Next
        DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
        DoCmd.DoMenuItem A_FORMBAR, A_EDIT, A_UNDO
        DoCmd.Close A_FORM, "Options"
    End Select

  Case "Form"
    Select Case parmAction
      Case "Close"
        DoCmd.OpenForm "Options List", A_NORMAL
        DoCmd.Requery "lbOptions List"
    End Select
End Select


End Function

Function JobOrder(parmObject, parmAction)

Dim cb As ComboBox
Dim lclReturn As Integer
Dim lclError As Integer

Select Case parmObject
'/////
    Case "Form"
    Select Case parmAction
      Case "On Close"
        DoCmd.OpenForm "Job Order List", A_NORMAL
        DoCmd.Requery "lbJob Order List"

      Case "On Current"
        lclReturn = JobOrder("Type", "On Current")
        DoCmd.GoToRecord A_FORM, "Job Order", A_FIRST
        DoCmd.GoToControl "tbJob Number"
'////
      Case "Save Record"
        lclError = 0

        If (Forms![job order]![tbQuantity] < 1) Then
          MsgBox "Quantity must be greater than or equal to 1."
          lclError = -1
        End If

        If (IsNull(Forms![job order]![cbProduct ID])) Then
          MsgBox "You must enter a Primary Product ID."
          lclError = -1
        End If

        Select Case Forms![job order]![cbType]
          Case "Patio", "1 Sidelite", "2 Sidelite", "1 Gate", "2 Gate"
            If (IsNull(Forms![job order]![cbSecondary Product Id])) Then
              MsgBox "You must enter a Product ID for the Frame or Sidelite."
              lclError = -1
            End If
        End Select

        Select Case Forms![job order]![cbType]
          Case "1 Sidelite", "2 Sidelite"
            If (Forms![job order]![tbDoor Width] < 20) Then
              MsgBox "Door width must be greater than or equal to 20 inches."
             lclError = -1
            End If

            If (Forms![job order]![tbDoor Height] < 30) Then
              MsgBox "Door height must be greater than or equal to 30 inches."
              lclError = -1
            End If
        End Select

        Select Case Forms![job order]![cbType]
          Case "2 Gate"
            If (Forms![job order]![tbLeg Length] < 0) Then
              MsgBox "Leg Length must be greater than 0."
             lclError = -1
            End If
        End Select

        If (Forms![job order]![tbWidth] < 20) Then
          MsgBox "Measured width must be greater than or equal to 20 inches."
          lclError = -1
        End If

        If (Forms![job order]![tbHeight] < 30) Then
          MsgBox "Measured height must be greater than or equal to 30 inches."
          lclError = -1
        End If

        If (lclError) Then
          DoCmd.CancelEvent
        End If
        JobOrder = lclError
    End Select

  Case "Cut Sheet"
    Select Case parmAction
      Case "Push"
        lclError = JobOrder("Form", "Save Record")
        If Not (lclError) Then
          DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
          lclReturn = SetGlobalVariables(Forms![job order]![tbDoor ID])
          lclReturn = SetCutSheet("1")
        End If
    End Select

  Case "Print"
    Select Case parmAction
      Case "Push"
        lclError = JobOrder("Form", "Save Record")
        If Not (lclError) Then

' new clearance chk fun. by SIS called here 10/13/00
          
          Forms![job order]![txtAdjust] = chkClearance
          DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
          lclReturn = SetGlobalVariables(Forms![job order]![tbDoor ID])
          gbltitle = "Production Copy"
          DoCmd.OpenReport "Cut Sheet", A_PRINT, , "[Door ID] = Forms![Job Order]![tbDoor ID]"
          gbltitle = "File Copy"
          DoCmd.OpenReport "Cut Sheet", A_PRINT, , "[Door ID] = Forms![Job Order]![tbDoor ID]"
          DoCmd.OpenReport "Inspection Sheet", A_PRINT, , "[Door ID] = Forms![Job Order]![tbDoor ID]"
        End If
    End Select
'////
    Case "Preview"
    Select Case parmAction
      Case "Push"
        lclError = JobOrder("Form", "Save Record")
        If Not (lclError) Then

'new clear chk fun called here 10/13/00
          
          Forms![job order]![txtAdjust] = chkClearance
          DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
          lclReturn = SetGlobalVariables(Forms![job order]![tbDoor ID])
          gbltitle = "Production Copy"
         DoCmd.OpenReport "Cut Sheet", acViewPreview, , "[Door ID] = Forms![Job Order]![tbDoor ID]"
        End If
    End Select


 Case "GlassOrder"
    Select Case parmAction
      Case "Push"
        lclError = JobOrder("Form", "Save Record")
        If Not (lclError) Then
          DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
          lclReturn = SetGlobalVariables(Forms![job order]![tbDoor ID])
          DoCmd.OpenReport "Glass Order", A_PREVIEW, , "[Door ID] = Forms![Job Order]![tbDoor ID]"
        End If
    End Select

  Case "Cancel"
    Select Case parmAction
      Case "Push"
        On Error Resume Next
        DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
        DoCmd.DoMenuItem A_FORMBAR, A_EDIT, A_UNDO
        DoCmd.Close A_FORM, "Job Order"
    End Select
'////
  Case "OK"
    If IsNull(Forms![job order]!tbHeight) Then
        MsgBox "Existing Door Height Required", vbCritical
    End If
    Select Case parmAction
      Case "Push"
        lclError = JobOrder("Form", "Save Record")
        If Not (lclError) Then

'new clearance check fun. called from here - 10/13/00 SIS
          
          Forms![job order]![txtAdjust] = chkClearance
          DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
          DoCmd.Close A_FORM, "Job Order"
        End If
    End Select

  Case "Type"
    Select Case parmAction
      Case "After Update", "On Current"
      lclOrderType = Forms![job order]![cbType]

'*** Make controls visible that apply for the order
        Select Case lclOrderType
          Case "French", "Single"
            Forms![job order]![cbSecondary Product Id].Visible = 0
            Forms![job order]![tbSecondary Product Description].Visible = 0
            Forms![job order]![tbDoor Width].Visible = 0
            Forms![job order]![cbDoor Width Fraction].Visible = 0
            Forms![job order]![tbDoor Height].Visible = 0
            Forms![job order]![cbDoor Height Fraction].Visible = 0
            Forms![job order]![tbLeg Length].Visible = 0
            Forms![job order]![cbLeg Length Fraction].Visible = 0
    'add by SIS 1-31-01
    
            Forms![job order]![lLeg Length].Visible = -1
            Forms![job order]![lx2].Visible = -1
'..............

            If (lclOrderType = "Single") Then
              Forms![job order]![cbOperator].Visible = 0
              Forms![job order]![cbOperator] = "Left"
              gblOperator = "Left"
              Forms![job order]![cbHinge].Visible = -1
            Else
              Forms![job order]![cbOperator].Visible = -1
              Forms![job order]![cbHinge].Visible = 0
              Forms![job order]![cbHinge] = "Left"
              gblHinge = "Left"
            End If

          Case "Patio", "1 Gate", "2 Gate"
            Forms![job order]![cbSecondary Product Id].Visible = -1
            Forms![job order]![tbSecondary Product Description].Visible = -1
            Forms![job order]![cbOperator].Visible = -1
            Forms![job order]![tbDoor Width].Visible = 0
            Forms![job order]![cbDoor Width Fraction].Visible = 0
            Forms![job order]![tbDoor Height].Visible = 0
            Forms![job order]![cbDoor Height Fraction].Visible = 0
            Forms![job order]![cbHinge].Visible = -1
            
            If (lclOrderType = "2 Gate") Then
              Forms![job order]![cbOperator].Visible = -1
              Forms![job order]![tbLeg Length].Visible = -1
              Forms![job order]![cbLeg Length Fraction].Visible = -1
            Else
              Forms![job order]![cbOperator].Visible = 0
              Forms![job order]![cbOperator] = "Left"
              gblOperator = "Left"
              Forms![job order]![tbLeg Length].Visible = 0
              Forms![job order]![cbLeg Length Fraction].Visible = 0
            End If

          Case "1 Sidelite", "2 Sidelite"
            Forms![job order]![cbSecondary Product Id].Visible = -1
            Forms![job order]![tbSecondary Product Description].Visible = -1
            Forms![job order]![cbOperator].Visible = -1
            Forms![job order]![tbDoor Width].Visible = -1
            Forms![job order]![cbDoor Width Fraction].Visible = -1
            Forms![job order]![tbDoor Height].Visible = -1
            Forms![job order]![cbDoor Height Fraction].Visible = -1
            Forms![job order]![cbHinge].Visible = -1
            Forms![job order]![tbLeg Length].Visible = 0
            Forms![job order]![cbLeg Length Fraction].Visible = 0

            If (lclOrderType = "1 Sidelite") Then
              Forms![job order]![cbOperator].Visible = -1
            Else
              Forms![job order]![cbOperator].Visible = 0
              Forms![job order]![cbOperator] = "Left"
              gblOperator = "Left"
            End If

          Case "Window"
            lclProduct = "Window"
            lclSecondaryProduct = ""
            lclText = ""
        End Select

'*** If it's a single door, we can go to 1/8th inch.  Otherwise
'***  limit the list to 1/4th inch.
        If (lclOrderType = "Single") Then
           Forms![job order]![tbFraction Maximum] = 8
        Else
           Forms![job order]![tbFraction Maximum] = 4
        End If
        '/ Modified by SIS 8/26/99 to perform proper requery of combo box
        '/Removed by SIS 1/22/01 per Liberty
        'Set cb = Forms![job order]![cbWidth Fraction]
        'cb.Requery

'*** Depending on the type of door/gate we are building, the
'***  list of available products will change.
        Select Case lclOrderType
          Case "French", "Single"
            lclProduct = "Door"
            lclSecondaryProduct = ""
            lclText = ""
          Case "Patio"
            lclProduct = "Door"
            lclSecondaryProduct = "1 Frame"
            lclText = "Frame ID:"
          Case "1 Sidelite"
            lclProduct = "Door"
            lclSecondaryProduct = "1 Sidelite"
            lclText = "Sidelite ID:"
          Case "2 Sidelite"
            lclProduct = "Door"
            lclSecondaryProduct = "2 Sidelite"
            lclText = "Sidelite ID:"
          Case "1 Gate"
            lclProduct = "Gate"
            lclSecondaryProduct = "1 Frame"
            lclText = "Frame ID:"
          Case "2 Gate"
            lclProduct = "Gate"
            lclSecondaryProduct = "2 Frame"
            lclText = "Frame ID:"
          Case "Window"
            lclProduct = "Window"
            lclSecondaryProduct = ""
            lclText = ""
        End Select

'*** Only change the list of products if they are no longer valid.
'***  Do the same check for the secondary product.
        If Not (Forms![job order]![tbProduct ID Filter] = lclProduct) Then
          If (parmAction = "After Update") Then
            Forms![job order]![cbProduct ID] = ""
          End If

          Forms![job order]![tbProduct ID Filter] = lclProduct
          DoCmd.Requery "cbProduct ID"
          DoCmd.Requery "tbProduct Description"
        End If

        If Not (Forms![job order]![tbSecondary Product ID Filter] = lclSecondaryProduct) Then
          If (parmAction = "After Update") Then
            Forms![job order]![cbSecondary Product Id] = ""
          End If

          Forms![job order]![tbSecondary Product ID Filter] = lclSecondaryProduct
          DoCmd.Requery "cbSecondary Product ID"
          DoCmd.Requery "tbSecondary Product Description"
        End If

        Forms![job order]![tbSecondary Product ID Text] = lclText
    End Select

  Case "Product ID"
    Select Case parmAction
      Case "After Update"
        Forms![job order]![cbLock] = GetTableInformation("Product", Forms![job order]![cbProduct ID], "Default Lock")
    End Select
End Select

End Function

Function JobOrderList(parmObject, parmAction)



Select Case parmObject
  Case "Edit"
    Select Case parmAction
      Case "Push"
        If (Forms![Job Order List]![lbJob Order List] > 0) Then
          JobOrderList = SetGlobalVariables(Forms![Job Order List]![lbJob Order List])
          DoCmd.OpenForm "Job Order", A_NORMAL, , "[Door ID] = Forms![Job Order List]![lbJob Order List]", A_EDIT
        End If
    End Select

  Case "Add"
    Select Case parmAction
      Case "Push"
        DoCmd.OpenForm "Job Order", A_NORMAL, , , A_ADD
    End Select

  Case "Delete"
    Select Case parmAction
      Case "Push"
        If (Forms![Job Order List]![lbJob Order List] > 0) Then
          DoCmd.SetWarnings False
          DoCmd.RunSQL "DELETE * FROM [Door] WHERE [Door ID] = Forms![Job Order List]![lbJob Order List];"
          DoCmd.RunSQL "DELETE * FROM [Door Option] WHERE [Door ID] = Forms![Job Order List]![lbJob Order List];"
          DoCmd.SetWarnings True
          DoCmd.Requery "lbJob Order List"
        End If
    End Select

  Case "Close"
    Select Case parmAction
      Case "Push"
        DoCmd.Close A_FORM, "Job Order List"
    End Select
End Select

End Function

Function Options(parmObject, parmAction)

Select Case parmObject
  Case "OK"
    Select Case parmAction
      Case "Push"
        DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
        DoCmd.Close A_FORM, "Options"
    End Select

  Case "Cancel"
    Select Case parmAction
      Case "Push"
        On Error Resume Next
        DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
        DoCmd.DoMenuItem A_FORMBAR, A_EDIT, A_UNDO
        DoCmd.Close A_FORM, "Options"
    End Select

  Case "Form"
    Select Case parmAction
      Case "On Close"
        DoCmd.OpenForm "Options List", A_NORMAL
        DoCmd.Requery "lbOptions List"
      Case "On Current"
        DoCmd.GoToRecord A_FORM, "Options", A_FIRST
        DoCmd.GoToControl "cbOption Group"
    End Select
End Select

End Function

Function OptionsList(parmObject, parmAction)

Select Case parmObject
  Case "Edit"
    Select Case parmAction
      Case "Push"
        If (Forms![Options List]![lbOptions List] <> "") Then
          DoCmd.OpenForm "Options", A_NORMAL, , "[Option ID] = Forms![Options List]![lbOptions List]", A_EDIT
        End If
    End Select

  Case "Add"
    Select Case parmAction
      Case "Push"
        DoCmd.OpenForm "Options", A_NORMAL, , , A_ADD
    End Select

  Case "Close"
    Select Case parmAction
      Case "Push"
        DoCmd.Close A_FORM, "Options List"
    End Select
End Select



End Function

Function Product(parmObject, parmAction)

Select Case parmObject
  Case "OK"
    Select Case parmAction
      Case "Push"
        DoCmd.Close A_FORM, "Product"
    End Select

  Case "Components"
    Select Case parmAction
      Case "Push"
        DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
        DoCmd.OpenForm "Product Component", A_NORMAL, , "[Product ID] = Forms![Product]![tbProduct ID]", A_EDIT
    End Select

  Case "Cancel"
    Select Case parmAction
      Case "Push"
        On Error Resume Next
        DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
        DoCmd.DoMenuItem A_FORMBAR, A_EDIT, A_UNDO
        DoCmd.Close A_FORM, "Product"
    End Select

  Case "Form"
    Select Case parmAction
      Case "On Close"
        DoCmd.OpenForm "Product List", A_NORMAL
        DoCmd.Requery "lbProduct List"
      Case "On Current"
        DoCmd.GoToRecord A_FORM, "Product", A_FIRST
        If (Forms![Product]![tbProduct Id].Enabled = -1) Then
          DoCmd.GoToControl "tbProduct ID"
        Else
          DoCmd.GoToControl "tbDescription"
        End If
    End Select
End Select



End Function

Function ProductComponent(parmObject, parmAction)

Select Case parmObject
  Case "Close"
    Select Case parmAction
      Case "Push"
        DoCmd.Close A_FORM, "Product Component"
    End Select
End Select

End Function

Function ProductList(parmObject, parmAction)

Select Case parmObject
  Case "Edit"
    Select Case parmAction
      Case "Push"
        If (Forms![Product List]![lbProduct List] <> "") Then
          DoCmd.OpenForm "Product", A_NORMAL, , "[Product ID] = Forms![Product List]![lbProduct List]", A_EDIT
          DoCmd.GoToControl "tbDescription"
          Forms![Product]![tbProduct Id].Enabled = 0
          Forms![Product]![tbProduct Id].Locked = -1
        End If
    End Select

  Case "Add"
    Select Case parmAction
      Case "Push"
        DoCmd.OpenForm "Product", A_NORMAL, , , A_ADD
          Forms![Product]![tbProduct Id].Enabled = -1
          Forms![Product]![tbProduct Id].Locked = 0
    End Select

  Case "Close"
    Select Case parmAction
      Case "Push"
        DoCmd.Close A_FORM, "Product List"
    End Select
End Select



End Function

