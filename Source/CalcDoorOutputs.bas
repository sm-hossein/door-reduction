Attribute VB_Name = "CalcDoorOutputs"
Option Compare Database

' ==========================================================
' EXPORT RAW DOOR INPUTS
' - Matches Access Print Preview logic
' - Adds Product Description from Product table
' ==========================================================
Public Sub ExportRawDoorInputsToCSV(doorId)

    Dim db As DAO.Database
    Dim rsDoorDetails As DAO.Recordset
    Dim rsProd As DAO.Recordset

    Dim csvPath As String
    Dim f As Integer
    Dim sqlDetails As String
    Dim sqlProd As String
    Dim fld As DAO.Field
    Dim header As String
    Dim line As String
    Dim count As Long

    Dim out_MeasuredDim As String
    Dim out_RefDim As String
    Dim out_BuildDim As String
    Dim out_OrderType As String
    Dim out_Color As String
    Dim out_Hinge As String
    Dim out_Lock As String
    Dim out_BuildNotes As String
    Dim out_ClearanceNotes As String

    Dim productID As String
    Dim prodDesc As String

    csvPath = CurrentProject.Path & "\Door_Input_Data.csv"
    Set db = CurrentDb()

    f = FreeFile
    Open csvPath For Output As #f

    count = 0

    Debug.Print "Exporting Door (inputs):"; doorId

    ' -------------------------------
    ' Load Door Record
    ' -------------------------------
    sqlDetails = "SELECT * FROM [Door] WHERE [Door ID] = " & doorId
    Set rsDoorDetails = db.OpenRecordset(sqlDetails, dbOpenSnapshot)

    If Not rsDoorDetails.EOF Then

        ' -------------------------------------------------------
        ' Lookup Product Description
        ' -------------------------------------------------------
        productID = Nz(rsDoorDetails![Product ID], "")
        prodDesc = ""

        If productID <> "" Then
            sqlProd = "SELECT * FROM [Product] WHERE [Product ID] = '" & _
                      Replace(productID, "'", "''") & "'"
            Set rsProd = db.OpenRecordset(sqlProd, dbOpenSnapshot)

            If Not rsProd.EOF Then
                prodDesc = Nz(rsProd!Description, "")
            End If

            rsProd.Close
        End If

        ' -------------------------------------------------------
        ' FULL INITIALIZATION — same as Access Preview Report
        ' -------------------------------------------------------
        Call SetGlobalVariables(doorId)

        On Error Resume Next

        out_ClearanceNotes = chkClearance()
        ' 1) FORCE side effects FIRST
        out_BuildNotes = GetBuildNotes()

        ' 2) Options
        out_Hinge = GetOptions("Hinge")
        out_Lock = GetOptions("Lock")

        ' 3) Sizes
        out_MeasuredDim = GetSize("Opening Dimensions") & " " & GetOptions("Operator")
        out_RefDim = GetSize("Reference Dimension")
        out_BuildDim = GetSize("Dimensions") & " " & GetSide()

        ' 4) Lookups
        out_OrderType = GetOrderType("Door Type", rsDoorDetails!Type)
        out_Color = GetOrderType("Color", rsDoorDetails!Color)

        On Error GoTo 0

        ' -------------------------------------------------------
        ' Write header once
        ' -------------------------------------------------------
        If count = 0 Then
            For Each fld In rsDoorDetails.Fields
                header = header & fld.Name & ","
            Next fld

            header = header & _
                "MeasuredDimensions," & _
                "RefDimensions," & _
                "BuildDimensions," & _
                "OrderType," & _
                "ColorName," & _
                "ProductDescription," & _
                "HingeOutput," & _
                "LockOutput," & _
                "ClearanceNotes," & _
                "BuildNotes"

            Print #f, header
        End If

        ' -------------------------------------------------------
        ' Write door row
        ' -------------------------------------------------------
        line = ""
        For Each fld In rsDoorDetails.Fields
            line = line & Replace(Nz(fld.Value, ""), ",", ";") & ","
        Next fld

        line = line & Replace(Nz(out_MeasuredDim, ""), ",", ";") & ","
        line = line & Replace(Nz(out_RefDim, ""), ",", ";") & ","
        line = line & Replace(Nz(out_BuildDim, ""), ",", ";") & ","
        line = line & Replace(Nz(out_OrderType, ""), ",", ";") & ","
        line = line & Replace(Nz(out_Color, ""), ",", ";") & ","
        line = line & Replace(Nz(prodDesc, ""), ",", ";") & ","
        line = line & Replace(Nz(out_Hinge, ""), ",", ";") & ","
        line = line & Replace(Nz(out_Lock, ""), ",", ";") & ","
        line = line & Replace(Nz(out_ClearanceNotes, ""), ",", ";") & ","
        line = line & Replace(Nz(out_BuildNotes, ""), ",", ";")

        Print #f, line

    End If

    count = count + 1
    rsDoorDetails.Close

    Close #f

    MsgBox "Raw input export complete! " & count & _
           " doors saved to: " & csvPath

End Sub



' ==========================================================
' 2) export DOOR COMPONENTS
'    - Frame
'    - Internal
'    - Design
'    - Final
'    - Opening   (SPECIAL RULE):
'         ProductComponent.ProductID = Door.Type
'         Group='Opening'
'         Side = DoorType.Side (Side Number)
' ==========================================================
Public Sub ExportDoorComponentsToCSV(doorId)

    Dim db As DAO.Database
    Dim rsDoor As DAO.Recordset
    Dim rsProd As DAO.Recordset
    Dim rsComp As DAO.Recordset

    Dim csvPath As String
    Dim f As Integer

    Dim sqlDoors As String
    Dim sqlDoor As String
    Dim sqlProd As String
    Dim sqlComp As String
    Dim sqlOpen As String

    Dim productID As String              ' Door.Product ID
    Dim doorTypeValue As String          ' Door.Type (used as ProductID for Opening)
    Dim openingSide As Variant           ' Door Type.Side (Side Number)

    Dim header As String
    Dim line As String

    Dim prodType As String
    Dim glassType As String
    Dim prodDesc As String

    Dim compGroup As String
    Dim compSection As String
    Dim compSide As String
    Dim qty As Variant
    Dim meas As Variant
    Dim rawDesc As String
    Dim compCat As String
    Dim calcDesc As String
    Dim calcLoc As String
    Dim calcSize As String
    Dim Notes As String

    csvPath = CurrentProject.Path & "\Door_Components.csv"

    Set db = CurrentDb()
    f = FreeFile
    Open csvPath For Output As #f

    '------------- header row -------------
    header = "Door ID,Job Number,Job Name,Issue Date,Due Date," & _
             "Product ID,Product Description,Door Type,Product Type,Glass Type," & _
             "Component Group,Section,Side,Quantity,Measurement," & _
             "Raw Component Description,Component Category," & _
             "Component Description,Location,Size,Notes"
    Print #f, header

    ' newest doors by Issue Date

    Debug.Print "Exporting Door (components):"; doorId

    '-------- load Door row --------
    sqlDoor = "SELECT * FROM [Door] WHERE [Door ID] = " & doorId
    Set rsDoor = db.OpenRecordset(sqlDoor, dbOpenSnapshot)

    If Not rsDoor.EOF Then

        productID = Nz(rsDoor![Product ID], "")
        doorTypeValue = Nz(rsDoor![Type], "")

        ' IMPORTANT: match Preview init sequence
        On Error Resume Next
        Call SetGlobalVariables(doorId)
        On Error GoTo 0

        '==========================================
        ' A) FRAME / INTERNAL / DESIGN / FINAL
        '     (Product Component.Product ID = Door.Product ID)
        '==========================================
        If productID <> "" Then

            ' Product table (for Product Type / Glass Type / Description)
            sqlProd = "SELECT * FROM [Product] WHERE [Product ID] = '" & _
                      Replace(productID, "'", "''") & "'"
            Set rsProd = db.OpenRecordset(sqlProd, dbOpenSnapshot)

            If Not rsProd.EOF Then
                prodType = Nz(rsProd![Product Type], "")
                glassType = Nz(rsProd![Glass Type], "")
                prodDesc = Nz(rsProd![Description], "")
            Else
                prodType = ""
                glassType = ""
                prodDesc = ""
            End If
            rsProd.Close

            sqlComp = _
                "SELECT " & _
                "  [Product Component].[Quantity], " & _
                "  [Product Component].[Measurement], " & _
                "  [Product Component].[Section], " & _
                "  [Product Component].[Side], " & _
                "  [Product Component].[Group]            AS CompGroup, " & _
                "  Component.[Description]                AS RawDescription, " & _
                "  Component.[Category]                   AS CompCategory " & _
                "FROM Component INNER JOIN [Product Component] " & _
                "  ON Component.[Component ID] = [Product Component].[Component ID] " & _
                "WHERE [Product Component].[Product ID] = '" & Replace(productID, "'", "''") & "' " & _
                "  AND [Product Component].[Group] IN ('Frame','Internal','Design','Final') " & _
                "ORDER BY [Product Component].[Group], [Product Component].[Section], Component.[Description];"

            Set rsComp = db.OpenRecordset(sqlComp, dbOpenSnapshot)

            Do While Not rsComp.EOF

                compGroup = Nz(rsComp!compGroup, "")
                compSection = Nz(rsComp!Section, "")
                compSide = Nz(rsComp!Side, "")
                qty = Nz(rsComp!Quantity, "")
                meas = Nz(rsComp!Measurement, "")
                rawDesc = Nz(rsComp!RawDescription, "")
                compCat = Nz(rsComp!compCategory, "")

                gblNotes = ""

                On Error Resume Next
                calcDesc = GetComponentDescription(rawDesc, compGroup, compCat, compSection)
                calcLoc = GetComponentSection(rawDesc, compGroup, compCat, compSection)
                calcSize = GetComponentSize(rawDesc, compGroup, compCat, compSection)
                Notes = gblNotes
                On Error GoTo 0

                line = ""
                line = line & doorId & ","
                line = line & Replace(Nz(rsDoor![Job Number], ""), ",", ";") & ","
                line = line & Replace(Nz(rsDoor![Job Name], ""), ",", ";") & ","
                line = line & Format(Nz(rsDoor![Issue Date], ""), "yyyy-mm-dd") & ","
                line = line & Format(Nz(rsDoor![Due Date], ""), "yyyy-mm-dd") & ","

                line = line & productID & ","
                line = line & Replace(prodDesc, ",", ";") & ","
                line = line & Replace(Nz(rsDoor![Type], ""), ",", ";") & ","
                line = line & Replace(prodType, ",", ";") & ","
                line = line & Replace(glassType, ",", ";") & ","

                line = line & Replace(compGroup, ",", ";") & ","
                line = line & Replace(compSection, ",", ";") & ","
                line = line & Replace(compSide, ",", ";") & ","
                line = line & qty & ","
                line = line & Replace(Nz(meas, ""), ",", ";") & ","

                line = line & Replace(rawDesc, ",", ";") & ","
                line = line & Replace(compCat, ",", ";") & ","
                line = line & Replace(calcDesc, ",", ";") & ","
                line = line & Replace(calcLoc, ",", ";") & ","
                line = line & Replace(calcSize, ",", ";") & ","

                Notes = Nz(Notes, "")
                Notes = Replace(Notes, """", "''")
                line = line & """" & Notes & """"

                Print #f, line

                rsComp.MoveNext
            Loop

            rsComp.Close
        End If

        '==========================================
        ' B) OPENING
        '     SPECIAL RULE:
        '       Product Component.Product ID = Door.Type
        '       Group='Opening'
        '       Side = DoorType.Side (Side Number)
        '==========================================
        If doorTypeValue <> "" Then

            ' Side Number comes from [Door Type] table
            openingSide = DLookup("[Side]", "[Door Type]", "[Type]='" & Replace(doorTypeValue, "'", "''") & "'")

            If Not IsNull(openingSide) And Nz(openingSide, "") <> "" Then

                ' For Opening rows, "Product ID" column should reflect the thing we used to fetch them (Door.Type)
                ' Product Description / Product Type / Glass Type: not from Product table (these Opening components are keyed by Door.Type)
                ' We keep Door’s Product Description/Type/Glass as blank here unless you want a separate lookup table.
                prodDesc = ""
                prodType = ""
                glassType = ""

                sqlOpen = _
                    "SELECT " & _
                    "  [Product Component].[Quantity], " & _
                    "  [Product Component].[Measurement], " & _
                    "  [Product Component].[Section], " & _
                    "  [Product Component].[Side], " & _
                    "  [Product Component].[Group]            AS CompGroup, " & _
                    "  Component.[Description]                AS RawDescription, " & _
                    "  Component.[Category]                   AS CompCategory " & _
                    "FROM Component INNER JOIN [Product Component] " & _
                    "  ON Component.[Component ID] = [Product Component].[Component ID] " & _
                    "WHERE [Product Component].[Product ID] = '" & Replace(doorTypeValue, "'", "''") & "' " & _
                    "  AND [Product Component].[Group] = 'Opening' " & _
                    "  AND [Product Component].[Side] = '" & Replace(CStr(openingSide), "'", "''") & "' " & _
                    "ORDER BY [Product Component].[Section], Component.[Description];"

                Set rsComp = db.OpenRecordset(sqlOpen, dbOpenSnapshot)

                Do While Not rsComp.EOF

                    compGroup = Nz(rsComp!compGroup, "")
                    compSection = Nz(rsComp!Section, "")
                    compSide = Nz(rsComp!Side, "")
                    qty = Nz(rsComp!Quantity, "")
                    meas = Nz(rsComp!Measurement, "")
                    rawDesc = Nz(rsComp!RawDescription, "")
                    compCat = Nz(rsComp!compCategory, "")

                    gblNotes = ""

                    On Error Resume Next
                    calcDesc = GetComponentDescription(rawDesc, compGroup, compCat, compSection)
                    calcLoc = GetComponentSection(rawDesc, compGroup, compCat, compSection)
                    calcSize = GetComponentSize(rawDesc, compGroup, compCat, compSection)
                    Notes = gblNotes
                    On Error GoTo 0

                    line = ""
                    line = line & doorId & ","
                    line = line & Replace(Nz(rsDoor![Job Number], ""), ",", ";") & ","
                    line = line & Replace(Nz(rsDoor![Job Name], ""), ",", ";") & ","
                    line = line & Format(Nz(rsDoor![Issue Date], ""), "yyyy-mm-dd") & ","
                    line = line & Format(Nz(rsDoor![Due Date], ""), "yyyy-mm-dd") & ","

                    ' IMPORTANT: Opening query uses Door.Type as the ProductID key
                    line = line & doorTypeValue & ","
                    line = line & Replace(prodDesc, ",", ";") & ","
                    line = line & Replace(Nz(rsDoor![Type], ""), ",", ";") & ","
                    line = line & Replace(prodType, ",", ";") & ","
                    line = line & Replace(glassType, ",", ";") & ","

                    line = line & Replace(compGroup, ",", ";") & ","
                    line = line & Replace(compSection, ",", ";") & ","
                    line = line & Replace(compSide, ",", ";") & ","
                    line = line & qty & ","
                    line = line & Replace(Nz(meas, ""), ",", ";") & ","

                    line = line & Replace(rawDesc, ",", ";") & ","
                    line = line & Replace(compCat, ",", ";") & ","
                    line = line & Replace(calcDesc, ",", ";") & ","
                    line = line & Replace(calcLoc, ",", ";") & ","
                    line = line & Replace(calcSize, ",", ";") & ","

                    Notes = Nz(Notes, "")
                    Notes = Replace(Notes, """", "''")
                    line = line & """" & Notes & """"

                    Print #f, line

                    rsComp.MoveNext
                Loop

                rsComp.Close
            End If
        End If

    End If


    Close #f
    MsgBox "Door component export complete! File saved to: " & csvPath

End Sub



Public Sub TestOutput()

    Dim doorId As String
    doorId = 60893
    ExportRawDoorInputsToCSV (doorId)
    ExportDoorComponentsToCSV (doorId)
End Sub



