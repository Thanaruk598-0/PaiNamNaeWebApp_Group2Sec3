*** Settings ***
Library    SeleniumLibrary

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        Chrome
${URL}            http://localhost:3001/login
${USERNAME}       Passenger
${PASSWORD}       t1234567

${IMAGE_PATH}     ${CURDIR}/test.jpg
${INVALID_FILE}   ${CURDIR}/test.txt

${MYREPORT_URL}   http://localhost:3001/myReports


*** Test Cases ***

TC03 Submit Report With Missing Required Fields
    Login To System
    Go To My Report Page
    Fill Form With Missing Required Fields

    Scroll Element Into View    xpath=//button[contains(.,'ส่งรายงาน')]
    Click Element    xpath=//button[contains(.,'ส่งรายงาน')]

    Verify Required Field Alert
    Logout


TC04 Upload Invalid File Type
    Login To System
    Go To My Report Page
    Fill Form With Invalid File
    Logout


*** Keywords ***

Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    0.7s


Login To System
    Go To    ${URL}
    Wait Until Element Is Visible    id=identifier    15s
    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Click Element    xpath=//button[normalize-space()="เข้าสู่ระบบ"]
    Wait Until Page Does Not Contain Element    id=identifier    20s


Logout
    Go To    ${URL}
    Wait Until Element Is Visible    id=identifier    15s


Go To My Report Page
    Go To    ${MYREPORT_URL}
    Wait Until Page Contains    รายงานของฉัน    15s


# ================= TC03 =================

Fill Form With Missing Required Fields
    Click Element    xpath=//button[normalize-space()='สูง']
    Choose File    xpath=//input[@type='file']    ${IMAGE_PATH}
    Sleep    2s


Verify Required Field Alert
    Wait Until Page Contains
    ...    กรุณากรอกข้อมูลให้ครบทุกช่อง
    ...    15s
    Capture Page Screenshot    after_submit_click.png

# ================= TC04 =================

Fill Form With Invalid File
    Select From List By Index    xpath=(//select)[1]    1
    Select From List By Label    xpath=(//select)[2]    ความปลอดภัย
    Select From List By Label    xpath=(//select)[3]    คนขับมีพฤติกรรมไม่เหมาะสม
    Click Element    xpath=//button[normalize-space()='สูง']

    Input Text
    ...    xpath=//textarea[contains(@placeholder,'อธิบาย')]
    ...    คนขับ ขับรถหวาดเสียวและตะโกนด่ารถคันอื่นๆ ตลอด

    Wait Until Page Contains Element    xpath=//input[@type='file']    15s

    Capture Page Screenshot    before_upload.png

    Run Keyword And Ignore Error
    ...    Choose File    xpath=//input[@type='file']    ${INVALID_FILE}

    Sleep    1s

    ${status}    ${message}=    Run Keyword And Ignore Error    Handle Alert    ACCEPT

    Log To Console    Alert message: ${message}

    Should Contain    ${message}    รูปภาพและวิดีโอ

    Capture Page Screenshot    after_alert.png