*** Settings ***
Library    SeleniumLibrary
Library    Dialogs

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        chrome
${URL}            http://localhost:3001/login
${USERNAME}       User01
${PASSWORD}       t1234567

*** Test Cases ***
Create New Incident Report Without Image
    Login To System
    Go To My Report Page
    Fill Incident Report Form Without Image
    Submit Report
    Verify Success

*** Keywords ***
Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s
    Capture Page Screenshot    noimg_login_open.png

Login To System
    Wait Until Element Is Visible    id=identifier    15s
    Capture Page Screenshot    noimg_login_page.png

    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Capture Page Screenshot    noimg_login_filled.png

    Click Element    xpath=//button[normalize-space()="เข้าสู่ระบบ"]
    Wait Until Location Contains    3001    15s
    Capture Page Screenshot    noimg_login_success.png

Go To My Report Page
    Wait Until Element Is Visible    xpath=//a[contains(@href,'myReports')]    5s
    Click Element    xpath=//a[contains(@href,'myReports')]
    Wait Until Location Contains    myReports    10s
    Capture Page Screenshot    noimg_myreports_page.png

Fill Incident Report Form Without Image
    Select From List By Value    xpath=(//select)[1]    DRIVER
    Capture Page Screenshot    noimg_category_selected.png

    Input Text    xpath=//input[contains(@placeholder,'สรุป')]    ขับรถและพูดจาไม่สุภาพ
    Capture Page Screenshot    noimg_title_entered.png

    Execute JavaScript
    ...    document.evaluate("//button[normalize-space()='สูง']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.scrollIntoView({block:'center'});
    Sleep    1s
    Click Element    xpath=//button[normalize-space()='สูง']
    Capture Page Screenshot    noimg_priority_selected.png

    Input Text
    ...    xpath=//textarea[contains(@placeholder,'อธิบาย')]
    ...    คนขับ ขับรถหวาดเสียวและตะโกนด่ารถคันอื่นๆ ตลอด
    Capture Page Screenshot    noimg_description_entered.png

    Pause Execution    กรุณาคลิกปักหมุดบนแผนที่ (ถนน มะลิวัลย์) แล้วกด OK เพื่อดำเนินการต่อ
    Capture Page Screenshot    noimg_location_pinned.png

Submit Report
    Execute JavaScript
    ...    document.evaluate("//button[normalize-space()='ส่งรายงาน']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.scrollIntoView({block:'center'});
    Sleep    1s
    Click Element    xpath=//button[normalize-space()='ส่งรายงาน']
    Capture Page Screenshot    noimg_submit_clicked.png

Verify Success
    Wait Until Page Contains    ส่งรายงานเรียบร้อยแล้ว    20s
    Capture Page Screenshot    noimg_success.png
