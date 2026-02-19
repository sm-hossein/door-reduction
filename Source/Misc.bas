Attribute VB_Name = "Misc"
Option Compare Text   'Use database order for string comparisons

Function GetTitle()

  GetTitle = gbltitle

End Function

Function IsOperator()

'*** Detmines wheter or not the door is the operator door or not.
Select Case gblType
  Case "1 Gate", "Single"
    IsOperator = True
  Case "Patio"
    If (gblCurrentSide = gblHinge) Then
      IsOperator = False
    Else
      IsOperator = True
    End If
  Case Else
    If ((gblOperator = "Left" And gblCurrentSide = "Left") Or (gblOperator = "Right" And gblCurrentSide = "Right")) Then
      IsOperator = True
    Else
      IsOperator = False
    End If
End Select

End Function

Function SetCutSheet(parmOption)

gblRecordID = parmOption

Select Case parmOption
    Case "1"
        gblCurrentSide = "Left"
        DoCmd.OpenForm "Cut Sheet", A_NORMAL, , "[Door ID] =  Forms![Job Order]![tbDoor ID] AND [Side] = '1'", A_READONLY

    Case "2"
        gblCurrentSide = "Right"
        DoCmd.OpenForm "Cut Sheet", A_NORMAL, , "[Door ID] =  Forms![Job Order]![tbDoor ID] AND [Side] = '2'", A_READONLY

    Case "3"
        gblCurrentSide = "Left"
        DoCmd.OpenForm "Cut Sheet", A_NORMAL, , "[Door ID] =  Forms![Job Order]![tbDoor ID] AND [Side] = '3'", A_READONLY
End Select


End Function

Function SetPrintCutSheet(parmOption)

gblRecordID = parmOption

Select Case parmOption
  Case "1"
    gblCurrentSide = "Left"
    ' lclReturn = SetGlobalVariables(Forms![Job Order]![tbDoor ID])

  Case "2"
    gblCurrentSide = "Right"
    ' lclReturn = SetGlobalVariables(Forms![Job Order]![tbDoor ID])

  Case "3"
    gblCurrentSide = "Left"
    ' lclReturn = SetGlobalVariables(Forms![Job Order]![tbDoor ID])
End Select
End Function

