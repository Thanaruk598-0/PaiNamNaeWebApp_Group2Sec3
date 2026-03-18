*** Settings ***
Library    SeleniumLibrary
Library    Dialogs

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${URL}            http://localhost:3001/login
${BROWSER}        chrome
${USER}           Passenger
${PASS}           t1234567
${SLIP_PATH}      ${CURDIR}/slip.jpg


*** Test Cases ***
TC12 Passenger Upload Slip Payment
    Login As Passenger
    Open My Trip Page
    Select Confirmed Tab
    Open Payment Popup
    Click Pay Button
    Upload Slip
    Confirm Payment
    Verify Waiting Status


*** Keywords ***

Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    0.5s


Login As Passenger
    Wait Until Element Is Visible    id=identifier    10s
    Input Text    id=identifier    ${USER}
    Input Text    xpath=//input[@type="password"]    ${PASS}
    Click Element    xpath=//button[contains(.,'เข้าสู่ระบบ')]
    Wait Until Element Is Not Visible    id=identifier


Open My Trip Page
    Go To    http://localhost:3001/myTrip

    Execute JavaScript
    ...    document.body.style.zoom='80%'

    Wait Until Page Contains    การเดินทางของฉัน


Select Confirmed Tab
    Click Element    xpath=//button[contains(.,'ยืนยันแล้ว')]
    Sleep    2s


Open Payment Popup
    Click Element    xpath=//button[contains(.,'ชำระเงิน')]

    Wait Until Page Contains    ข้อมูลการชำระเงิน    10s
    Capture Page Screenshot    payment_popup.png
    Sleep    2s


Click Pay Button
    ${modal}=    Set Variable    xpath=//div[contains(@class,'fixed')]

    Wait Until Element Is Visible
    ...    ${modal}//button[contains(@class,'bg-blue-600')]
    ...    10s

    Execute JavaScript
    ...    document.querySelector("button.bg-blue-600").click()

    Capture Page Screenshot    after_click_pay.png


Upload Slip
    Log    >>> กรุณาอัปโหลดสลิป แล้วกด "ตรวจสอบ" ด้วย จากนั้นกด OK <<<
    Pause Execution
    Capture Page Screenshot    after_manual_upload.png

Confirm Payment
 
    Wait Until Element Is Visible    xpath=//button[contains(.,'ตรวจสอบ')]    10s
    Click Element    xpath=//button[contains(.,'ตรวจสอบ')]

    Capture Page Screenshot    after_click_verify.png
    Sleep    2s


    Wait Until Page Contains    ยืนยันและส่ง    10s

    Capture Page Screenshot    confirm_popup.png


    Click Element    xpath=//button[contains(.,'ส่งหลักฐาน')]

    Capture Page Screenshot    after_submit.png
    Sleep    3s

Verify Waiting Status
    Go To    http://localhost:3001/myTrip

    Wait Until Page Contains    การเดินทางของฉัน    10s

    Click Element    xpath=//button[contains(.,'ยืนยันแล้ว')]
    Sleep    2s

    Wait Until Keyword Succeeds    15s    2s
    ...    Page Should Contain    รอตรวจสอบ

    Capture Page Screenshot    success_waiting.png