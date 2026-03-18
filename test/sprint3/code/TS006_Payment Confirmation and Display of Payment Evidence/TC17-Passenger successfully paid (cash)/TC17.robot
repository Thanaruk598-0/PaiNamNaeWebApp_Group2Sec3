*** Settings ***
Library    SeleniumLibrary

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${URL}            http://localhost:3001/login
${MYTRIP_URL}     http://localhost:3001/myTrip
${BROWSER}        chrome
${USER}           Passenger
${PASS}           t1234567


*** Test Cases ***
TC16 Passenger Cash Payment
    Login As Passenger
    Open My Trip Page
    Select Confirmed Tab
    Open Payment Popup
    Select Cash Method
    Confirm Cash Payment
    Verify Cash Status


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
    Go To    ${MYTRIP_URL}
    Execute JavaScript
    ...    document.body.style.zoom='80%'
    Wait Until Page Contains    การเดินทางของฉัน


Select Confirmed Tab
    Click Element    xpath=//button[contains(.,'ยืนยันแล้ว')]
    Sleep    2s


Open Payment Popup
    Click Element    xpath=//button[contains(.,'ชำระเงิน')]
    Wait Until Page Contains    ข้อมูลการชำระเงิน    10s
    Capture Page Screenshot    cash_popup.png



Select Cash Method
    Wait Until Element Is Visible
    ...    xpath=//button[.//text()[contains(.,'เงินสด')]]
    ...    10s

    Click Element
    ...    xpath=//button[.//text()[contains(.,'เงินสด')]]

    Sleep    1s


Confirm Cash Payment
    Wait Until Element Is Visible
    ...    xpath=//button[contains(@class,'bg-blue-600')]
    ...    10s

    Click Element    xpath=//button[contains(@class,'bg-blue-600')]

    Capture Page Screenshot    after_click_pay_cash.png
    Sleep    2s

    Wait Until Page Contains    ยืนยันและส่ง    10s

    Capture Page Screenshot    cash_confirm_popup.png

    Click Element    xpath=//button[contains(.,'ส่งหลักฐาน')]

    Capture Page Screenshot    after_submit_cash.png
    Sleep    3s



Verify Cash Status
    Go To    http://localhost:3001/myTrip

    Wait Until Page Contains    การเดินทางของฉัน    10s
    Click Element    xpath=//button[contains(.,'ยืนยันแล้ว')]
    Sleep    2s

    Wait Until Keyword Succeeds    15s    2s
    ...    Page Should Contain    รอตรวจสอบ

    Capture Page Screenshot    cash_status.png