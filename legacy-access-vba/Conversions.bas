Attribute VB_Name = "Conversions"
Option Compare Text   'Use database order for string comparisons

Function Dimensions(parmOption, parmWidth, parmHeight)

Select Case parmOption
    Case "Width"
        Dimensions = IIf(Int(parmWidth) = 0, "", Int(parmWidth)) & IIf((parmWidth - Int(parmWidth)) = 0, "", IIf(Int(parmWidth) = 0, "", " - ") & IntToFraction(parmWidth - Int(parmWidth)))
    Case "Height"
        Dimensions = IIf(Int(parmHeight) = 0, "", Int(parmHeight)) & IIf((parmHeight - Int(parmHeight)) = 0, "", IIf(Int(parmHeight) = 0, "", " - ") & IntToFraction(parmHeight - Int(parmHeight)))
    Case "Both"
        Dimensions = Dimensions("Width", parmWidth, 0) & "  x  " & Dimensions("Height", 0, parmHeight)
End Select

End Function

Function FractionToInt(parmFraction)

Dim db As Database, tblFractions As DAO.Recordset

Set db = CurrentDb()
Set tblFractions = db.OpenRecordset("Fractions", dbOpenTable)

tblFractions.Index = "Description"
tblFractions.Seek "=", parmFraction

FractionToInt = tblFractions("Decimal")

End Function

Function IntToFraction(parmInt)

Dim db As Database, tblFractions As DAO.Recordset

Set db = CurrentDb()
Set tblFractions = db.OpenRecordset("Fractions", dbOpenTable)

tblFractions.Index = "Decimal"
tblFractions.Seek "=", parmInt

IntToFraction = tblFractions("Description")

End Function

Sub Init()

End Sub

