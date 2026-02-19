Attribute VB_Name = "ClearanceCheck"

Option Compare Database
Option Explicit

'code from here down new by SIS 10/18/00
'updated by Grandin 25-OCT-2003

'Build out
Const LATH14 As Single = 0.25
Const LATH38 As Single = 0.375
Const TUBE As Single = 1

'Glass clearance
Const NORMAL_GLASS = 0.25

Const DOOR_HEIGHT = 79

'D = Deadbolt
'K = Knob
'L = Lever
'R = Reverse
'L = Lower Bound of Range
'U = Upper Bound of Range

'M = 4-Way Mortise
'Deadbolt
Const MDL As Single = 36.875
Const MDU As Single = 38.875
Const MRDL As Single = 40.875
Const MRDU As Single = 42.875
Const MDP As Single = 0.625
'Knob
Const MKL As Single = 40.375
Const MKU As Single = 42.75
Const MRKL As Single = 37
Const MRKU As Single = 39.375
Const MKP As Single = 2.5
'Lever
Const MLL As Single = 40.875
Const MLU As Single = 42.5
Const MRLL As Single = 37.25
Const MRLU As Single = 38.875
Const MLP As Single = 2

'Y = Yale
'Deadbolt
Const YDL As Single = 37
Const YDU As Single = 39.125
Const YRDL As Single = 40.125
Const YRDU As Single = 42.25
Const YDP As Single = 1.25
'Knob
Const YKL As Single = 40.375
Const YKU As Single = 42.375
Const YRKL As Single = 37.25
Const YRKU As Single = 39.25
Const YKP As Single = 2.625
'Lever
Const YLL As Single = 41
Const YLU As Single = 42
Const YRLL As Single = 37.625
Const YRLU As Single = 38.625
Const YLP As Single = 2.25

'S = Slimline
'Deadbolt
Const SDL As Single = 41.375
Const SDU As Single = 42.5
Const SDP As Single = 0.5
'Lever
Const SLL As Single = 38.5
Const SLU As Single = 40.25
Const SLP As Single = 1.625

'Return values
Const GLASS_FAILED As Integer = 0
Const NO_ADJUSTMENT As Integer = 1
Const REVERSE_LOCK As Integer = 2
Const LEVER_REQUIRED As Integer = 3
Const REVERSE_LEVER As Integer = 4
Const LATH14_REQUIRED As Integer = 5
Const LATH38_REQUIRED As Integer = 6
Const LATH14_LEVER As Integer = 7
Const LATH38_LEVER As Integer = 8
Const REVERSE_LATH14 As Integer = 9
Const REVERSE_LATH38 As Integer = 10
Const REVERSE_LEVER_LATH14 As Integer = 11
Const REVERSE_LEVER_LATH38 As Integer = 12
Const TUBE_REQUIRED As Integer = 13
Const TUBE_LEVER As Integer = 14
Const REVERSE_TUBE As Integer = 15
Const REVERSE_LEVER_TUBE As Integer = 16
Const CHECK_FAILED As Integer = 17
Const BAD_LOCK As Integer = 18

'This function is the entry point for checking the overall clearance of a door
'including glass, knob, lever, and deadbolt.  it will make recommendations
'if the lockset can be reversed, or if a lever or build out appears to correct
'the problem
Function chkClearance() As String

    Dim iKClear As Single
    Dim iDoorHt As Single
    Dim iDBClear As Single
    Dim iKLoc As Single
    Dim iKLocB As Single
    Dim iDBLocB As Single
    Dim iDBLoc As Single
    Dim iLocAdjust As Single
    Dim iLockType As Integer
    Dim sDoorType As String
    Dim sOut As String
    Dim bGlassNrom As Boolean
    Dim bGlass14Lath As Boolean
    Dim bGlass38Lath As Boolean
    Dim bGlassTube As Boolean
    Dim bUpGrade As Boolean
    Dim sChkClear As String
    Dim sLType As String
    Dim ichkLoc As Integer
    Dim ichkUpgradeLoc As Integer
    Dim iGlassAdj As Single
    Dim sGetSizeHT As Single
    
    Dim lclReturn As Integer
    Dim lowestClearance As Single
    
    'calc door height to make ht adjustment from - per Liberty 2-3-01 use GetSize
    DoCmd.DoMenuItem A_FORMBAR, A_FILE, A_SAVERECORD
    lclReturn = JobOrder("Type", "On Current")
    DoCmd.GoToRecord A_FORM, "Job Order", A_FIRST
    lclReturn = SetGlobalVariables(Forms![job order]![tbDoor ID])
    iDoorHt = GetSize("total height")

    'validate form
    If IsNull(Forms![job order]!txtExDBLoc) Then
         Forms![job order]!txtExDBLoc = 0
    End If
    If IsNull(Forms![job order]!txtEXDBLocB) Then
         Forms![job order]!txtEXDBLocB = 0
    End If
    If IsNull(Forms![job order]!txtExDBProj) Then
        Forms![job order]!txtExDBProj = 0
    End If
    If IsNull(Forms![job order]!txtExKLoc) Then
        Forms![job order]!txtExKLoc = 0
    End If
    If IsNull(Forms![job order]!txtExKLocB) Then
        Forms![job order]!txtExKLocB = 0
    End If
    If IsNull(Forms![job order]!txtExKProj) Then
        Forms![job order]!txtExKProj = 0
    End If
   
    'if for either EXDB or ExK both top and bottom are zero set proj = 3"
    If Forms![job order]!txtExKLoc = 0 And Forms![job order]!txtExKLocB = 0 Then
        Forms![job order]!txtExKProj = 3
    End If
    If Forms![job order]!txtExDBLoc = 0 And Forms![job order]!txtEXDBLocB = 0 Then
        Forms![job order]!txtExDBProj = 3
    End If

    'if chkLock is Yes then no clearance info was entered and Liberty wants to say
    '"No adjustment needed" and then exit clearance
    If Forms![job order]!chkLockOK = -1 Then
        chkClearance = "No adjustment needed - clearance check skipped"
        Exit Function
    End If
    
    'Determine door height (ht), and knob (K) and dead bolt (DB) location (Loc) and projection (P) in decimal
    If Forms![job order]!tbHeight = 0 Then
        MsgBox "Door height was not entered - clearance check not performed"
        chkClearance = "Door height was not entered - clearance check not performed"
        Exit Function
    End If
    
    'make sure lock is specified
    If IsNull(Forms![job order]!cbLock.Column(2)) Then
        MsgBox "Lock Type Required", vbCritical
        Forms![job order]!cbLock.SetFocus
        Exit Function
    End If

    'initialize
    iKClear = Forms![job order]!txtExKProj
    iDBClear = Forms![job order]!txtExDBProj
    iKLoc = Forms![job order]!txtExKLoc
    iKLocB = Forms![job order]!txtExKLocB
    iDBLoc = Forms![job order]!txtExDBLoc
    iDBLocB = Forms![job order]!txtEXDBLocB
    
    'Determine location adjustment (if any)
    iLocAdjust = iDoorHt - DOOR_HEIGHT
    
    'determine which lock part projects further
    If iDBClear < iKClear Then
        lowestClearance = iDBClear
    Else
        lowestClearance = iKClear
    End If
    
    'calculate additional build out required for glass
    iGlassAdj = NORMAL_GLASS - lowestClearance
    
    'get lock type
    iLockType = Forms![job order]!cbLock.Column(2)
    
    'MsgBox _
    "iKClear = " & iKClear & vbCrLf & _
    "iDBClear = " & iDBClear & vbCrLf & _
    "iKLoc = " & iKLoc & vbCrLf & _
    "iKLocB = " & iKLocB & vbCrLf & _
    "iDBLoc = " & iDBLoc & vbCrLf & _
    "iDBLocB = " & iDBLocB & vbCrLf & _
    "iLocAdjust = " & iLocAdjust & vbCrLf & _
    "lowestClearance = " & lowestClearance & vbCrLf & _
    "iGlassAdj = " & iGlassAdj & vbCrLf & _
    "iDoorHt = " & iDoorHt
    
    ichkLoc = chkDBKLoc(iLockType, iLocAdjust, iDBClear, iKClear, iDBLoc, _
                        iDBLocB, iKLoc, iKLocB, iGlassAdj)

    'if clearance fails for yale try 4-way
    If ichkLoc = CHECK_FAILED And iLockType = 61 Then
        ichkUpgradeLoc = chkDBKLoc(60, iLocAdjust, iDBClear, iKClear, iDBLoc, _
                            iDBLocB, iKLoc, iKLocB, iGlassAdj)
        If ichkUpgradeLoc <> CHECK_FAILED Then
            ichkLoc = ichkUpgradeLoc
            bUpGrade = True
        End If
    End If
     
    chkClearance = OutPut(ichkLoc)
    
    If bUpGrade Then
        chkClearance = chkClearance & vbCrLf & _
                "Upgrade to 4-Way Mortise Lock is required"
    End If
    
End Function

'set clearance parameters based on lock type and call function to determine
'what if any changes are required
Function chkDBKLoc(ByVal iLockType As Integer, _
                    ByVal iLocAdjust As Single, _
                    ByVal iDBClear As Single, _
                    ByVal iKClear As Single, _
                    ByVal iDBLoc As Single, _
                    ByVal iDBLocB As Single, _
                    ByVal iKLoc As Single, _
                    ByVal iKLocB As Single, _
                    ByVal iGlassAdj As Single) As Integer

'db = deadbolt, l = lever, k = knob, ub = upper bound, lb = lower bound, r = reverse,  p = projection
    Dim iDBLB As Single
    Dim iDBUB As Single
    Dim iRDBLB As Single
    Dim iRDBUB As Single
    Dim iDBP As Single
    
    Dim iKLB As Single
    Dim iKUB As Single
    Dim iRKLB As Single
    Dim iRKUB As Single
    Dim iKP As Single
    
    Dim iLLB As Single
    Dim iLUB As Single
    Dim iRLLB As Single
    Dim iRLUB As Single
    Dim iLP As Single
    
    Select Case iLockType
    
        '4 way mortise
        Case 60
            iDBLB = iLocAdjust + MDL
            iDBUB = iLocAdjust + MDU
            iRDBLB = iLocAdjust + MRDL
            iRDBUB = iLocAdjust + MRDU
            iKLB = iLocAdjust + MKL
            iKUB = iLocAdjust + MKU
            iRKLB = iLocAdjust + MRKL
            iRKUB = iLocAdjust + MRKU
            iLLB = iLocAdjust + MLL
            iLUB = iLocAdjust + MLU
            iRLLB = iLocAdjust + MRLL
            iRLUB = iLocAdjust + MRLU
            iDBP = MDP
            iKP = MKP
            iLP = MLP
        
        'Yale
        Case 61
            iDBLB = iLocAdjust + YDL
            iDBUB = iLocAdjust + YDU
            iRDBLB = iLocAdjust + YRDL
            iRDBUB = iLocAdjust + YRDU
            iKLB = iLocAdjust + YKL
            iKUB = iLocAdjust + YKU
            iRKLB = iLocAdjust + YRKL
            iRKUB = iLocAdjust + YRKU
            iLLB = iLocAdjust + YLL
            iLUB = iLocAdjust + YLU
            iRLLB = iLocAdjust + YRLL
            iRLUB = iLocAdjust + YRLU
            iDBP = YDP
            iKP = YKP
            iLP = YLP
            
        'Slimline or Bee Line
        Case 69, 83, 126
            iDBLB = iLocAdjust + SDL
            iDBUB = iLocAdjust + SDU
            iRDBLB = 0
            iRDBUB = 0
            iKLB = 0
            iKUB = 0
            iRKLB = 0
            iRKUB = 0
            iLLB = iLocAdjust + SLL
            iLUB = iLocAdjust + SLU
            iRLLB = 0
            iRLUB = 0
            iDBP = SDP
            iKP = 0
            iLP = SLP
            
    End Select
        
    chkDBKLoc = chkClear(iDBUB, iDBLB, iRDBLB, iRDBUB, iDBP, _
                         iKLB, iKUB, iRKLB, iRKUB, iLLB, iLUB, _
                         iRLLB, iRLUB, iKP, iLP, iDBClear, _
                         iKClear, iDBLoc, iDBLocB, iKLoc, iKLocB, _
                         iLockType, iGlassAdj)
    
End Function

'check the clearance based upon lock type.  each lock type has a specific
'sequence to determine the best modification if lock parts won't clear
Function chkClear(ByVal iDBUB As Single, _
                  ByVal iDBLB As Single, _
                  ByVal iRDBLB As Single, _
                  ByVal iRDBUB As Single, _
                  ByVal iDBP As Single, _
                  ByVal iKLB As Single, _
                  ByVal iKUB As Single, _
                  ByVal iRKLB As Single, _
                  ByVal iRKUB As Single, _
                  ByVal iLLB As Single, _
                  ByVal iLUB As Single, _
                  ByVal iRLLB As Single, _
                  ByVal iRLUB As Single, _
                  ByVal iKP As Single, _
                  ByVal iLP As Single, _
                  ByVal iDBClear As Single, _
                  ByVal iKClear As Single, _
                  ByVal iDBLoc As Single, _
                  ByVal iDBLocB As Single, _
                  ByVal iKLoc As Single, _
                  ByVal iKLocB As Single, _
                  ByVal iLockType As Integer, _
                  ByVal iGlassAdj As Single) As Integer

    If iGlassAdj > TUBE Then
        chkClear = GLASS_FAILED
        Exit Function
    End If
        
    Select Case iLockType
    
        'slimline  (db=deadbolt, l= lever, k = knob, ub= upper bound, lb = lower bound)
        Case 69, 83, 126

            'Chk Lever (there is not a knob for slimeline/beeline)
            If iGlassAdj = 0 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, iLUB, _
                      iDBP, iLP, iDBClear, iKClear, 0) Then
                chkClear = NO_ADJUSTMENT
                
            'Chk 1/4Lath & Lever
            ElseIf iGlassAdj <= LATH14 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, iLUB, _
                          iDBP, iLP, iDBClear, iKClear, LATH14) Then
                chkClear = LATH14_REQUIRED
            
            'Chk 3/8Lath & Lever
            ElseIf iGlassAdj <= LATH38 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, iLUB, _
                          iDBP, iLP, iDBClear, iKClear, LATH38) Then
                chkClear = LATH38_REQUIRED
            
            'Chk Tube and Lever
            ElseIf chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, iLUB, _
                          iDBP, iLP, iDBClear, iKClear, TUBE) Then
                chkClear = TUBE_REQUIRED
            
            'All options failed
            Else
                chkClear = CHECK_FAILED
                
            End If

        '4 way mortise or yale
        Case 60, 61
                          
            If iGlassAdj <= 0 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iKLB, _
                      iKUB, iDBP, iKP, iDBClear, iKClear, 0) Then
                chkClear = NO_ADJUSTMENT
                                
            'Chk Reverse if glass doesn't already require build out
            ElseIf iGlassAdj <= 0 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, iRKLB, _
                          iRKUB, iDBP, iKP, iDBClear, iKClear, 0) Then
                chkClear = REVERSE_LOCK
                    
            'Chk Lever if glass doesn't already require build out
            ElseIf iGlassAdj <= 0 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, iLUB, _
                        iDBP, iLP, iDBClear, iKClear, 0) Then
                chkClear = LEVER_REQUIRED
                    
            'Chk Rev Lever if glass doesn't already require build out
            ElseIf iGlassAdj <= 0 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, _
                           iRLLB, iRLUB, iDBP, iLP, iDBClear, iKClear, 0) Then
                chkClear = REVERSE_LEVER
                        
            'Chk 1/4Lath
            ElseIf iGlassAdj <= LATH14 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, _
                        iKLB, iKUB, iDBP, iKP, iDBClear, iKClear, LATH14) Then
                chkClear = LATH14_REQUIRED
                        
            'Chk 3/8Lath
            ElseIf iGlassAdj <= LATH38 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iKLB, _
                        iKUB, iDBP, iKP, iDBClear, iKClear, LATH38) Then
                chkClear = LATH38_REQUIRED
                        
            'Chk 1/4Lath & Lever if glass doesn't already require build out
            ElseIf iGlassAdj <= LATH14 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, _
                        iLUB, iDBP, iLP, iDBClear, iKClear, LATH14) Then
                chkClear = LATH14_LEVER
                
            'Chk 3/8Lath & Lever if glass doesn't already require build out
            ElseIf iGlassAdj <= LATH38 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, _
                        iLUB, iDBP, iLP, iDBClear, iKClear, LATH38) Then
                chkClear = LATH38_LEVER
               
            'Chk Rev 1/4Lath if glass doesn't already require build out
            ElseIf iGlassAdj <= LATH14 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, iRKLB, _
                    iRKUB, iDBP, iKP, iDBClear, iKClear, LATH14) Then
                chkClear = REVERSE_LATH14
                
            'Chk Rev 3/8Lath if glass doesn't already require build out
            ElseIf iGlassAdj <= LATH38 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, iRKLB, _
                            iRKUB, iDBP, iKP, iDBClear, iKClear, LATH38) Then
                chkClear = REVERSE_LATH38
              
            'Chk Rev 1/4Lath and Lever if glass doesn't already require build out
            ElseIf iGlassAdj <= LATH14 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, iRLLB, _
                            iRLUB, iDBP, iLP, iDBClear, iKClear, LATH14) Then
                chkClear = REVERSE_LEVER_LATH14
                
            'Chk Rev 3/8Lath and Lever if glass doesn't already require build out
            ElseIf iGlassAdj <= LATH38 And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, _
                        iRLLB, iRLUB, iDBP, iLP, iDBClear, iKClear, LATH38) Then
                chkClear = REVERSE_LEVER_LATH38

            'Chk Tube if glass doesn't already require build out
            ElseIf iGlassAdj <= TUBE And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, _
                        iKLB, iKUB, iDBP, iKP, iDBClear, iKClear, TUBE) Then
                chkClear = TUBE_REQUIRED

            'Chk Tube and Lever if glass doesn't already require build out
            ElseIf iGlassAdj <= TUBE And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, _
                        iLLB, iLUB, iDBP, iLP, iDBClear, iKClear, TUBE) Then
                chkClear = TUBE_LEVER
                
            'Chk Rev Tube if glass doesn't already require build out
            ElseIf iGlassAdj <= TUBE And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, _
                        iRKLB, iRKUB, iDBP, iKP, iDBClear, iKClear, TUBE) Then
                chkClear = REVERSE_TUBE
                
            'Chk Rev Tube and Lever if glass doesn't already require build out
            ElseIf iGlassAdj <= TUBE And chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, _
                        iRLLB, iRLUB, iDBP, iLP, iDBClear, iKClear, TUBE) Then
                chkClear = REVERSE_LEVER_TUBE
                        
            'all Options fail
            Else
                chkClear = CHECK_FAILED
            
            End If
            
        Case Else
            chkClear = BAD_LOCK

    End Select

End Function

'this checks to see if its clearance is met for a particular configuration
Function chkLoc(ByVal deadBoltLoc As Single, _
                ByVal deadBoltLocB As Single, _
                ByVal knobLoc As Single, _
                ByVal knobLocB As Single, _
                ByVal deadBoltLowerBound As Single, _
                ByVal deadBoltUpperBound As Single, _
                ByVal knobLowerBound As Single, _
                ByVal knobUpperBound As Single, _
                ByVal deadBoltProjection As Single, _
                ByVal knobProjection As Single, _
                ByVal deadBoltClearance As Single, _
                ByVal knobClearance As Single, _
                ByVal adjustment As Single) As Boolean

    chkLoc = True

    'Check existing deadbolt position against new door deadbolt
    If (deadBoltLoc >= deadBoltLowerBound Or deadBoltLocB >= deadBoltLowerBound) And _
            (deadBoltLoc <= deadBoltUpperBound Or deadBoltLocB <= deadBoltUpperBound) And _
            (deadBoltProjection > deadBoltClearance + adjustment) Then
            
        chkLoc = False
        
    'Check existing deadbolt position against new door knob
    ElseIf (deadBoltLoc >= knobLowerBound Or deadBoltLocB >= knobLowerBound) And _
            (deadBoltLoc <= knobUpperBound Or deadBoltLocB <= knobUpperBound) And _
            (knobProjection > deadBoltClearance + adjustment) Then
            
        chkLoc = False
    
    'Check existing knob position against new door knob
    ElseIf (knobLoc >= knobLowerBound Or knobLocB >= knobLowerBound) And _
            (knobLocB <= knobUpperBound Or knobLoc <= knobUpperBound) And _
            (knobProjection > knobClearance + adjustment) Then
            
        chkLoc = False
        
    'Check existing knob position against new door deadbolt
    ElseIf (knobLoc >= deadBoltLowerBound Or knobLocB >= deadBoltLowerBound) And _
            (knobLoc <= deadBoltUpperBound Or knobLocB <= deadBoltUpperBound) And _
            (deadBoltProjection > knobClearance + adjustment) Then
            
        chkLoc = False
        
    End If

End Function

'this returns mapping of a return code to the proper string message
Function OutPut(ByVal chkOut As Integer) As String
    Select Case chkOut
        Case GLASS_FAILED
            OutPut = "Clearance Checked Failed - not able to adjust glass"
        Case NO_ADJUSTMENT
            OutPut = "No Adjustment Required"
        Case REVERSE_LOCK
            OutPut = "Reverse Lock Set Required"
        Case LEVER_REQUIRED
            OutPut = "Lever Required"
        Case REVERSE_LEVER
            OutPut = "Reverse Lever Required"
        Case LATH14_REQUIRED
            OutPut = "1/4-in Lath Required"
        Case LATH38_REQUIRED
            OutPut = "3/8-in Lath Required"
        Case LATH14_LEVER
            OutPut = "1/4-in Lath and Lever Required"
        Case LATH38_LEVER
            OutPut = "3/8-in Lath and Lever Required"
        Case REVERSE_LATH14
            OutPut = "Reverse and 1/4-in Lath Required"
        Case REVERSE_LATH38
            OutPut = "Reverse and 3/8-in Lath Required"
        Case REVERSE_LEVER_LATH14
            OutPut = "Reverse Lever and 1/4-in Lath Required"
        Case REVERSE_LEVER_LATH38
            OutPut = "Reverse Lever and 3/8-in Lath Required"
        Case TUBE_REQUIRED
            OutPut = "Tube Frame Required"
        Case TUBE_LEVER
            OutPut = "Tube Frame and Lever Required"
        Case REVERSE_TUBE
            OutPut = "Reverse Tube Frame Required"
        Case REVERSE_LEVER_TUBE
            OutPut = "Reverse Lever and Tube Frame Required"
        Case CHECK_FAILED
            OutPut = "Clearance Checked Failed - not able to adjust door"
        Case BAD_LOCK
            OutPut = "Lock Type not recognized - Clearance check not performed"
        Case Else
            OutPut = "Improper Clearance Check"
    End Select
End Function


