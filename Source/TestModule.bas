Attribute VB_Name = "TestModule"
Option Compare Database


' ==========================================================
' DEBUG EXPORT — ONLY DOOR 65862
' WITH CORRECT INITIALIZATION USING SetGlobalVariables
' ==========================================================
Public Sub Debug_ExportDoor65862()

    Dim doorID As Long
    doorID = 65862        ' <-- the door we are debugging

    Dim db As DAO.Database
    Dim rsDoor As DAO.Recordset
    Dim rsProd As DAO.Recordset
    Dim rsComp As DAO.Recordset
    Dim rsDoorType As DAO.Recordset

    Dim sqlDoor As String
    Dim sqlProd As String
    Dim sqlComp As String
    Dim sqlDoorType As String
    Dim sqlOpen As String

    Dim csvPath As String
    Dim f As Integer
    Dim line As String

    Dim productID As String
    Dim prodType As String
    Dim prodDesc As String
    Dim glassType As String

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

    Dim doorTypeValue As String
    Dim doorSide As String


    ' OUTPUT FILE
    csvPath = CurrentProject.Path & "\DEBUG_65862.csv"
    Set db = CurrentDb()

    f = FreeFile
    Open csvPath For Output As #f

    ' HEADER ROW
    Print #f, "DoorID,ProductID,Group,Section,Side,Qty,Meas,RawDesc,Cat,CalcDesc,Loc,Size,Notes"


    ' =====================================================================
    ' 1) LOAD DOOR ROW
    ' =====================================================================
    sqlDoor = "SELECT * FROM [Door] WHERE [Door ID] = " & doorID
    Set rsDoor = db.OpenRecordset(sqlDoor, dbOpenSnapshot)

    If rsDoor.EOF Then
        MsgBox "Door not found!"
        Close #f
        Exit Sub
    End If

    Debug.Print "DEBUG for Door: "; doorID

    productID = Nz(rsDoor![Product ID], "")
    doorTypeValue = Nz(rsDoor![Type], "")

    ' =====================================================================
    ' 2) LOAD PRODUCT ROW
    ' =====================================================================
    If productID <> "" Then
        sqlProd = "SELECT * FROM [Product] WHERE [Product ID]='" & Replace(productID, "'", "''") & "'"
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
    End If


    ' =====================================================================
    ' 3) CRITICAL STEP — INITIALIZE EVERYTHING LIKE ACCESS PREVIEW
    ' =====================================================================
    Debug.Print "Calling SetGlobalVariables…"

    Call SetGlobalVariables(doorID)

    Debug.Print "Init Done — gbl values now match Access Preview."


    ' =====================================================================
    ' 4) EXPORT COMPONENTS: Frame + Internal + Design + Final
    ' =====================================================================
    sqlComp = _
        "SELECT PC.[Product ID], PC.[Quantity], PC.[Measurement], " & _
        "PC.[Section], PC.[Side], PC.[Group] AS CompGroup, " & _
        "C.[Description] AS RawDesc, C.[Category] AS CompCat " & _
        "FROM Component AS C INNER JOIN [Product Component] AS PC " & _
        "ON C.[Component ID] = PC.[Component ID] " & _
        "WHERE PC.[Product ID]='" & Replace(productID, "'", "''") & "' " & _
        "AND PC.[Group] IN ('Frame') " & _
        "ORDER BY PC.[Group], PC.[Section], C.[Description];"

','Internal','Design','Final'
    Set rsComp = db.OpenRecordset(sqlComp, dbOpenSnapshot)

    Do While Not rsComp.EOF

        compGroup = Nz(rsComp!compGroup, "")
        compSection = Nz(rsComp!Section, "")
        compSide = Nz(rsComp!Side, "")
        qty = Nz(rsComp!Quantity, "")
        meas = Nz(rsComp!Measurement, "")
        rawDesc = Nz(rsComp!rawDesc, "")
        compCat = Nz(rsComp!compCat, "")

        gblNotes = ""

        calcDesc = GetComponentDescription(rawDesc, compGroup, compCat, compSection)
        calcLoc = GetComponentSection(rawDesc, compGroup, compCat, compSection)
        calcSize = GetComponentSize(rawDesc, compGroup, compCat, compSection)
        Notes = gblNotes

        line = doorID & "," & productID & "," & _
               compGroup & "," & compSection & "," & compSide & "," & qty & "," & _
               Replace(meas, ",", ";") & "," & _
               Replace(rawDesc, ",", ";") & "," & _
               Replace(compCat, ",", ";") & "," & _
               Replace(calcDesc, ",", ";") & "," & _
               Replace(calcLoc, ",", ";") & "," & _
               Replace(calcSize, ",", ";") & ",""" & Replace(Notes, """", "''") & """"

        Print #f, line

        Debug.Print "COMP:", compGroup, rawDesc, calcSize, Notes

        rsComp.MoveNext
    Loop

    rsComp.Close



    ' =====================================================================
    ' 5) EXPORT OPENING COMPONENTS (Side must match Door Type.Side)
    ' =====================================================================
    sqlDoorType = "SELECT * FROM [Door Type] WHERE [Type]='" & Replace(doorTypeValue, "'", "''") & "'"
    Set rsDoorType = db.OpenRecordset(sqlDoorType, dbOpenSnapshot)

    Do While Not rsDoorType.EOF

        doorSide = Nz(rsDoorType!Side, "")

        If doorSide <> "" Then
            sqlOpen = _
                "SELECT PC.[Product ID], PC.[Quantity], PC.[Measurement], " & _
                "PC.[Section], PC.[Side], PC.[Group] AS CompGroup, " & _
                "C.[Description] AS RawDesc, C.[Category] AS CompCat " & _
                "FROM Component AS C INNER JOIN [Product Component] AS PC " & _
                "ON C.[Component ID] = PC.[Component ID] " & _
                "WHERE PC.[Product ID]='" & Replace(productID, "'", "''") & "' " & _
                "AND PC.[Group]='Opening' " & _
                "AND PC.[Side]='" & Replace(doorSide, "'", "''") & "' " & _
                "ORDER BY PC.[Section], C.[Description];"

            Set rsComp = db.OpenRecordset(sqlOpen, dbOpenSnapshot)

            Do While Not rsComp.EOF

                compGroup = Nz(rsComp!compGroup, "")
                compSection = Nz(rsComp!Section, "")
                compSide = Nz(rsComp!Side, "")
                qty = Nz(rsComp!Quantity, "")
                meas = Nz(rsComp!Measurement, "")
                rawDesc = Nz(rsComp!rawDesc, "")
                compCat = Nz(rsComp!compCat, "")

                gblNotes = ""

                calcDesc = GetComponentDescription(rawDesc, compGroup, compCat, compSection)
                calcLoc = GetComponentSection(rawDesc, compGroup, compCat, compSection)
                calcSize = GetComponentSize(rawDesc, compGroup, compCat, compSection)
                Notes = gblNotes

                line = doorID & "," & productID & "," & _
                       compGroup & "," & compSection & "," & compSide & "," & qty & "," & _
                       Replace(meas, ",", ";") & "," & _
                       Replace(rawDesc, ",", ";") & "," & _
                       Replace(compCat, ",", ";") & "," & _
                       Replace(calcDesc, ",", ";") & "," & _
                       Replace(calcLoc, ",", ";") & "," & _
                       Replace(calcSize, ",", ";") & ",""" & Replace(Notes, """", "''") & """"

                Print #f, line

                Debug.Print "OPEN:", compGroup, rawDesc, calcSize, Notes

                rsComp.MoveNext
            Loop

            rsComp.Close
        End If

        rsDoorType.MoveNext
    Loop

    rsDoorType.Close


    Close #f

    MsgBox "DEBUG EXPORT for Door " & doorID & " COMPLETE: " & vbCrLf & csvPath

End Sub


Public Sub TestOpeningQueries()

    Dim db As DAO.Database
    Dim rs As DAO.Recordset
    Dim productID As String
    Dim doorType As String
    Dim doorSide As String
    Dim q As String
    Dim doorID As Long
    
    doorID = 65862

    Set db = CurrentDb()

    '---------------------------------------------
    ' Get ProductID + Door Type + Side for the door
    '---------------------------------------------
    Dim rsDoor As DAO.Recordset
    Set rsDoor = db.OpenRecordset("SELECT * FROM Door WHERE [Door ID] = " & doorID)

    If rsDoor.EOF Then
        Debug.Print "Door not found:", doorID
        Exit Sub
    End If

    productID = Nz(rsDoor![Product ID], "")
    doorType = Nz(rsDoor!Type, "")

    ' Get all door type sides
    Dim rsDT As DAO.Recordset
    Set rsDT = db.OpenRecordset("SELECT * FROM [Door Type] WHERE [Type] = '" & doorType & "'")

    If rsDT.EOF Then
        Debug.Print "No door type rows found for:", doorType
        Exit Sub
    End If

    Debug.Print "=============================================="
    Debug.Print "DOOR:", doorID
    Debug.Print "ProductID:", productID
    Debug.Print "Door Type:", doorType
    Debug.Print "=============================================="

    Do While Not rsDT.EOF

        doorSide = Nz(rsDT!Side, "")
        Debug.Print vbCrLf & "------ DOOR SIDE = "; doorSide; " ------"

        ' ========== QUERY 1 ============================
        Debug.Print "Test 1: Simple match Group='Opening' + Side="
        q = "SELECT * FROM [Product Component] WHERE " & _
            "[Product ID] = '" & productID & "' AND [Group] = 'Opening' AND [Side] = '" & doorSide & "'"

        Set rs = db.OpenRecordset(q)
        Call PrintRS(rs)

        ' ========== QUERY 2 ============================
        Debug.Print "Test 2: Must also match Section = Side"
        q = "SELECT * FROM [Product Component] WHERE " & _
            "[Product ID] = '" & productID & "' AND [Group] = 'Opening' AND " & _
            "[Side] = '" & doorSide & "' AND [Section] = '" & doorSide & "'"

        Set rs = db.OpenRecordset(q)
        Call PrintRS(rs)

        ' ========== QUERY 3 ============================
        Debug.Print "Test 3: Using Component table join"
        q = "SELECT PC.*, C.Description FROM Component AS C " & _
            "INNER JOIN [Product Component] AS PC ON C.[Component ID] = PC.[Component ID] " & _
            "WHERE PC.[Product ID] = '" & productID & "' AND PC.[Group]='Opening' AND PC.[Side]='" & doorSide & "'"

        Set rs = db.OpenRecordset(q)
        Call PrintRS(rs)

        ' ========== QUERY 4 ============================
        Debug.Print "Test 4: Group='Opening' + Section = 'Opening'"
        q = "SELECT * FROM [Product Component] WHERE " & _
            "[Product ID] = '" & productID & "' AND [Group]='Opening' AND [Section]='Opening'"

        Set rs = db.OpenRecordset(q)
        Call PrintRS(rs)

        ' ========== QUERY 5 ============================
        Debug.Print "Test 5: Try match Section = tbGroupOpening (unknown)"
        ' Modify this as needed when we discover tbGroupOpening value

        rsDT.MoveNext
    Loop

    Debug.Print "=============== END OF TESTS ================="

End Sub

' Helper: prints a recordset's Group/Section/Side/Description
Private Sub PrintRS(rs As DAO.Recordset)
    If rs.EOF Then
        Debug.Print "  (no rows)"
        Exit Sub
    End If

    Do While Not rs.EOF
        Debug.Print "  Group=" & Nz(rs!Group, "") & _
                    "  Section=" & Nz(rs!Section, "") & _
                    "  Side=" & Nz(rs!Side, "") & _
                    "  Qty=" & Nz(rs!Quantity, "") & _
                    "  Desc=" & Nz(rs!Description, "")
        rs.MoveNext
    Loop
End Sub


Public Sub DebugDoorInputCalculations_65862()

    Dim db As DAO.Database
    Dim rsDoor As DAO.Recordset
    Dim doorID As Long

    ' --- calculated outputs ---
    Dim out_MeasuredDim As String
    Dim out_RefDim As String
    Dim out_OrderType As String
    Dim out_Color As String
    Dim out_Hinge As String
    Dim out_Lock As String
    Dim out_BuildNotes As String

    doorID = 60950
    Set db = CurrentDb()

    Debug.Print "=============================================="
    Debug.Print "DOOR INPUT CALCULATION DEBUG"
    Debug.Print "Door ID: "; doorID
    Debug.Print "=============================================="

    Set rsDoor = db.OpenRecordset( _
        "SELECT * FROM [Door] WHERE [Door ID] = " & doorID, _
        dbOpenSnapshot _
    )

    If rsDoor.EOF Then
        Debug.Print "? Door not found."
        Exit Sub
    End If

    ' -------------------------------------------------
    ' EXACT SAME INIT SEQUENCE AS PREVIEW BUTTON
    ' -------------------------------------------------
    On Error Resume Next

    ' Matches Preview ? JobOrder ? SetGlobalVariables path
    Call SetGlobalVariables(doorID)

    ' -------------------------------------------------
    ' CALCULATED FIELDS
    ' (same expressions used in ExportRawDoorInputsToCSV)
    ' -------------------------------------------------
    out_BuildNotes = GetBuildNotes()
    out_Hinge = GetOptions("Hinge")
    out_Lock = GetOptions("Lock")
    out_MeasuredDim = GetSize("Opening Dimensions") & " - " & GetOptions("Operator")
    out_RefDim = GetSize("Reference Dimension")
    out_OrderType = GetOrderType("Door Type", rsDoor("Type"))
    out_Color = GetOrderType("Color", rsDoor("Color"))

    On Error GoTo 0

    ' -------------------------------------------------
    ' PRINT RAW INPUTS
    ' -------------------------------------------------
    Debug.Print ""
    Debug.Print "----- RAW DOOR FIELDS -----"
    Debug.Print "Job Number: "; rsDoor("Job Number")
    Debug.Print "Job Name: "; rsDoor("Job Name")
    Debug.Print "Order Notes: "; rsDoor("Order Notes")
    Debug.Print "Issue Date: "; rsDoor("Issue Date")
    Debug.Print "Due Date: "; rsDoor("Due Date")
    Debug.Print "Quantity: "; rsDoor("Quantity")
    Debug.Print "Product ID: "; rsDoor("Product ID")
    Debug.Print "Secondary Product ID: "; rsDoor("Secondary Product ID")
    Debug.Print "Type: "; rsDoor("Type")
    Debug.Print "Width: "; rsDoor("Width")
    Debug.Print "Height: "; rsDoor("Height")
    Debug.Print "Door Width: "; rsDoor("Door Width")
    Debug.Print "Door Height: "; rsDoor("Door Height")
    Debug.Print "Hinge: "; rsDoor("Hinge")
    Debug.Print "Lock: "; rsDoor("Lock")
    Debug.Print "Operator: "; rsDoor("Operator")
    Debug.Print "Color: "; rsDoor("Color")

    ' -------------------------------------------------
    ' PRINT CALCULATED OUTPUTS
    ' -------------------------------------------------
    Debug.Print ""
    Debug.Print "----- CALCULATED OUTPUTS -----"
    Debug.Print "MeasuredDimensions: "; out_MeasuredDim
    Debug.Print "RefDimensions: "; out_RefDim
    Debug.Print "OrderType: "; out_OrderType
    Debug.Print "ColorName: "; out_Color
    Debug.Print "HingeOutput: "; out_Hinge
    Debug.Print "LockOutput: "; out_Lock
    Debug.Print "BuildNotes: "; out_BuildNotes

    Debug.Print ""
    Debug.Print "=========== END DEBUG ==========="

    rsDoor.Close

End Sub





